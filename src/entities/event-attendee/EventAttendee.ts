import { Field, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Unique, wrap } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import { QueryEvent } from '@util/constants.events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member', 'supporter'] })
export default class EventAttendee extends BaseEntity {
  static cache: Cache = new Cache();

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    await wrap(this.event).init();

    EventAttendee.cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_ATTENDEES}-${this.event.id}`,
      `${QueryEvent.GET_EVENT_ATTENDEES}-${this.member?.id}`,
      `${QueryEvent.GET_EVENT_ATTENDEES}-${this.supporter?.id}`,
      `${QueryEvent.GET_EVENT_ATTENDEES}-${this.event.community.id}`,
      `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${this.event.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event)
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Field(() => Supporter, { nullable: true })
  @ManyToOne(() => Supporter, { nullable: true })
  supporter: Supporter;
}
