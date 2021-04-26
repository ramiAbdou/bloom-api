import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  wrap
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import getGoogleCalendarEvent from '@integrations/google/repo/getGoogleCalendarEvent';
import { APP } from '@util/constants';
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
  recordingUrl?: string;

  @Field()
  @Property()
  startTime: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  summary?: string;

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

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ event }) => event)
  eventAttendees = new Collection<EventAttendee>(this);

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ event }) => event)
  eventGuests = new Collection<EventGuest>(this);

  @Field(() => [EventInvitee])
  @OneToMany(() => EventInvitee, ({ event }) => event)
  eventInvitees = new Collection<EventInvitee>(this);

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ event }) => event)
  eventWatches = new Collection<EventWatch>(this);
}
