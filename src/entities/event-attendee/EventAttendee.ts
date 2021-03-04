import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  Entity,
  ManyToOne,
  PrimaryKeyType,
  Unique
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
export default class EventAttendee extends BaseEntity {
  // ## LIFECYCLE

  @AfterCreate()
  afterCreate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_ATTENDEES}-${this.event.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event, { primary: true })
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Field(() => Supporter, { nullable: true })
  @ManyToOne(() => Supporter, { nullable: true })
  supporter: Supporter;

  [PrimaryKeyType]: [string, string];
}
