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
  Property,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import getGoogleCalendarEvent from '@integrations/google/repo/getGoogleCalendarEvent';
import { APP } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';

export enum EventPrivacy {
  MEMBERS_ONLY = 'Members Only',
  OPEN_TO_ALL = 'Open to All'
}

@ObjectType()
@Entity()
export default class Event extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

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

  // ## METHODS

  @Field(() => String)
  async eventUrl(): Promise<string> {
    await wrap(this.community).init();
    return `${APP.CLIENT_URL}/${this.community?.urlName}/events/${this.id}`;
  }

  @Field(() => String, { nullable: true })
  async googleCalendarEventUrl(): Promise<string> {
    const googleCalendarEvent = await getGoogleCalendarEvent(
      this.googleCalendarEventId
    );

    return googleCalendarEvent.htmlLink;
  }

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate() {
    this.endTime = day.utc(this.endTime).format();
    this.startTime = day.utc(this.startTime).format();
  }

  @AfterCreate()
  afterCreate() {
    Event.cache.invalidateKeys([
      `${QueryEvent.GET_UPCOMING_EVENTS}-${this.community.id}`
    ]);
  }

  @AfterUpdate()
  afterUpdate() {
    Event.cache.invalidateKeys([
      `${QueryEvent.GET_EVENT}-${this.id}`,
      ...(day.utc().isAfter(day.utc(this.endTime))
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
