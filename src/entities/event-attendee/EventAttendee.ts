import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  Entity,
  ManyToOne,
  PrimaryKeyType,
  Property
} from '@mikro-orm/core';

import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class EventAttendee extends BaseCompositeEntity {
  @Field({ nullable: true })
  @Property({ nullable: true, primary: true })
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  lastName: string;

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

  [PrimaryKeyType]: [string, string];
}
