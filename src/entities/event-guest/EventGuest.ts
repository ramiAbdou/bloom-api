import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterDelete,
  BeforeCreate,
  Entity,
  ManyToOne,
  PrimaryKeyType,
  Property
} from '@mikro-orm/core';

import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import cache from '@core/db/cache';
import eventBus from '@core/events/eventBus';
import { BusEvent, GoogleEvent, QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class EventGuest extends BaseCompositeEntity {
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

  @BeforeCreate()
  beforeCreate() {
    if (!this.email) this.email = this.member?.user?.email;
    if (!this.firstName) this.firstName = this.member?.user?.firstName;
    if (!this.lastName) this.lastName = this.member?.user?.lastName;
  }

  @AfterCreate()
  afterCreate() {
    cache.invalidateKeys([`${QueryEvent.GET_EVENT_GUESTS}-${this.event.id}`]);

    eventBus.emit(BusEvent.GOOGLE_EVENT, {
      eventId: this.event.id,
      googleEvent: GoogleEvent.ADD_GOOGLE_CALENDAR_EVENT_ATTENDEE,
      guestId: this.id
    });
  }

  @AfterDelete()
  afterDelete() {
    cache.invalidateKeys([`${QueryEvent.GET_EVENT_GUESTS}-${this.event.id}`]);

    eventBus.emit(BusEvent.GOOGLE_EVENT, {
      eventId: this.event.id,
      googleEvent: GoogleEvent.DELETE_GOOGLE_CALENDAR_EVENT_ATTENDEE,
      guestId: this.id
    });
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event, { nullable: true, primary: true })
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  [PrimaryKeyType]: [string, string];
}
