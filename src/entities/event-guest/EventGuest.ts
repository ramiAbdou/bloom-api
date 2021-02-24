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
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';
import getEventGuestJoinUrl from './repo/getEventGuestJoinUrl';

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

  @Property({ persist: false })
  get joinUrl(): string | Promise<string> {
    return getEventGuestJoinUrl({ eventId: this.event.id, guestId: this.id });
  }

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
  }

  @AfterDelete()
  afterDelete() {
    cache.invalidateKeys([`${QueryEvent.GET_EVENT_GUESTS}-${this.event.id}`]);
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
