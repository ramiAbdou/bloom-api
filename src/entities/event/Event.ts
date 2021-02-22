import { IsUrl } from 'class-validator';
import day from 'dayjs';
import { Field, InputType, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';
import getEventUrl from './repo/getEventUrl';

@ObjectType()
@InputType('EventInput')
@Entity()
export default class Event extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  endTime: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  googleCalendarEventId?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  imageUrl?: string;

  @Field({ defaultValue: true })
  @Property()
  private: boolean = true;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  recordingUrl: string;

  @Field()
  @Property()
  startTime: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  summary: string;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property()
  @IsUrl()
  videoUrl: string;

  // ## MEMBER FUNCTIONS

  @Field(() => String)
  async eventUrl(): Promise<string> {
    return getEventUrl(
      { eventId: this.id },
      { communityId: this.community.id }
    );
  }

  @Field(() => String, { nullable: true })
  async googleCalendarEventUrl(): Promise<string> {
    if (!this.googleCalendarEventId) return null;
    return `${this.googleCalendarEventId}`;
  }

  // ## LIFECYCLE

  @BeforeCreate()
  beforeCreate() {
    this.endTime = day.utc(this.endTime).format();
    this.startTime = day.utc(this.startTime).format();
  }

  // ## RELATIONSHIPS

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ event }) => event)
  attendees = new Collection<EventAttendee>(this);

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ event }) => event)
  guests = new Collection<EventGuest>(this);

  @Field(() => [EventInvitee])
  @OneToMany(() => EventInvitee, ({ event }) => event)
  invitees = new Collection<EventInvitee>(this);

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ event }) => event)
  watches = new Collection<EventWatch>(this);
}
