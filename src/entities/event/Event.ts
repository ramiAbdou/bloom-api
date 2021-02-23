import { IsUrl } from 'class-validator';
import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterUpdate,
  BeforeCreate,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import getGoogleCalendarEvent from '../../integrations/google/repo/getGoogleCalendarEvent';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';
import getEventUrl from './repo/getEventUrl';

export enum EventPrivacy {
  MEMBERS_ONLY = 'Members Only',
  OPEN_TO_ALL = 'Open to All'
}

@ObjectType()
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

  @Field(() => String, { defaultValue: EventPrivacy.MEMBERS_ONLY })
  @Enum({ items: () => EventPrivacy, type: String })
  privacy: EventPrivacy = EventPrivacy.MEMBERS_ONLY;

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
  @Property({ persist: false })
  get eventUrl(): Promise<string> | string {
    return getEventUrl({ eventId: this.id });
  }

  @Field(() => String, { nullable: true })
  async googleCalendarEventUrl(): Promise<string> {
    const googleCalendarEvent = await getGoogleCalendarEvent(
      this.googleCalendarEventId
    );

    return googleCalendarEvent.htmlLink;
  }

  // ## LIFECYCLE

  @BeforeCreate()
  beforeCreate() {
    this.endTime = day.utc(this.endTime).format();
    this.startTime = day.utc(this.startTime).format();
  }

  @AfterCreate()
  afterCreate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_UPCOMING_EVENTS}-${this.community.id}`
    ]);
  }

  @AfterUpdate()
  afterUpdate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT}-${this.id}`,
      ...(day().isAfter(day(this.endTime))
        ? [`${QueryEvent.GET_PAST_EVENTS}-${this.community.id}`]
        : [`${QueryEvent.GET_UPCOMING_EVENTS}-${this.community.id}`])
    ]);
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
