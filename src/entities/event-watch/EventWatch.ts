import { Field, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Unique, wrap } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { QueryEvent } from '@util/constants.events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member'] })
export default class EventWatch extends BaseEntity {
  static cache: Cache = new Cache();

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate(): Promise<void> {
    await wrap(this.event).init();

    EventWatch.cache.invalidate([
      `${QueryEvent.LIST_EVENT_WATCHES}-${this.event.id}`,
      `${QueryEvent.LIST_EVENT_WATCHES}-${this.member.id}`,
      `${QueryEvent.LIST_EVENT_WATCHES}-${this.event.community.id}`
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
