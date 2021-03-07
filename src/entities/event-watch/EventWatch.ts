import { Field, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Unique, wrap } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member'] })
export default class EventWatch extends BaseEntity {
  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    await wrap(this.event).init();

    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_WATCHES}-${this.event.id}`,
      `${QueryEvent.GET_EVENT_WATCHES}-${this.member.id}`,
      `${QueryEvent.GET_EVENT_WATCHES}-${this.event.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event)
  event: Event;

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;
}
