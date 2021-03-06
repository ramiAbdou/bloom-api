import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterDelete,
  Entity,
  ManyToOne,
  Unique,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import { QueryEvent } from '@util/constants.events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member', 'supporter'] })
export default class EventGuest extends BaseEntity {
  static cache: Cache = new Cache();

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate(): Promise<void> {
    await wrap(this.event).init();

    EventGuest.cache.invalidate([
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.event.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.member?.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.supporter?.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.event.community.id}`,
      `${QueryEvent.LIST_UPCOMING_EVENT_GUESTS}-${this.event.community.id}`
    ]);
  }

  @AfterDelete()
  async afterDelete(): Promise<void> {
    await wrap(this.event).init();

    EventGuest.cache.invalidate([
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.event.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.member?.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.supporter?.id}`,
      `${QueryEvent.LIST_EVENT_GUESTS}-${this.event.community.id}`,
      `${QueryEvent.LIST_UPCOMING_EVENT_GUESTS}-${this.event.community.id}`
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
