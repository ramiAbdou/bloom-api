import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterDelete,
  Entity,
  ManyToOne,
  Unique,
  wrap
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import Supporter from '@entities/supporter/Supporter';
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member', 'supporter'] })
export default class EventGuest extends BaseEntity {
  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    await wrap(this.event).init();

    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_GUESTS}-${this.event.id}`,
      `${QueryEvent.GET_EVENT_GUESTS}-${this.member?.id}`,
      `${QueryEvent.GET_EVENT_GUESTS}-${this.supporter?.id}`,
      `${QueryEvent.GET_EVENT_GUESTS}-${this.event.community.id}`,
      `${QueryEvent.GET_UPCOMING_EVENT_GUESTS}-${this.event.community.id}`
    ]);
  }

  @AfterDelete()
  afterDelete() {
    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_GUESTS}-${this.event.id}`,
      `${QueryEvent.GET_EVENT_GUESTS}-${this.member?.id}`,
      `${QueryEvent.GET_EVENT_GUESTS}-${this.supporter?.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event, { nullable: true })
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Field(() => Supporter, { nullable: true })
  @ManyToOne(() => Supporter, { nullable: true })
  supporter: Supporter;
}
