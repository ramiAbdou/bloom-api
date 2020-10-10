/**
 * @fileoverview Entity: Event
 * @author Rami Abdou
 */

import { IsUrl } from 'class-validator';
import {
  BeforeCreate,
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, ObjectType } from 'type-graphql';

import { APP } from '@constants';
import { Community } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import URLBuilder from '@util/URLBuilder';
import EventAttendee from '../event-attendee/EventAttendee';
import EventRSVP from '../event-rsvp/EventRSVP';
import EventRepo from './EventRepo';

@ObjectType()
@Entity({ customRepository: () => EventRepo })
export default class Event extends BaseEntity {
  [EntityRepositoryType]?: EventRepo;

  /**
   * @example
   * """ If you're interested in pursuing a Software Engineering Internship,
   * RSVP on Jumpstart for our event with them next week! You’ll get a chance to
   * meet their team, ask questions about the application process, and more...
   * """
   */
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  endTime: string;

  /**
   * @example 10000
   * @example 10001
   * @example 10002
   * @example 10003
   * @example 10004
   */
  @Field()
  @Property({ type: Number })
  shortId: number;

  @Field()
  @Property()
  startTime: string;

  /**
   * @example ColorStack x Facebook: Day in the Life of a Software Engineer
   */
  @Field()
  @Property()
  title: string;

  @Field()
  @Property()
  zoomMeetingId: string;

  // Should ONLY be used by the host of the meeting. This URL will effectively
  // start the Zoom meeting.
  @Field()
  @Property({ nullable: true })
  @IsUrl()
  zoomHostUrl: string;

  // URL for participants to join the meeting.
  @Field()
  @Property()
  @IsUrl()
  zoomJoinUrl: string;

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => EventRSVP, ({ event }) => event)
  rsvps: Collection<EventRSVP> = new Collection<EventRSVP>(this);

  @OneToMany(() => EventAttendee, ({ event }) => event)
  attendees: Collection<EventAttendee> = new Collection<EventAttendee>(this);

  @Property({ persist: false })
  get joinUrl(): string {
    return new URLBuilder(
      `${APP.CLIENT_URL}/events/${this.zoomMeetingId}`
    ).addParam('join', true).url;
  }

  @Property({ persist: false })
  get hostUrl(): string {
    return new URLBuilder(`${APP.CLIENT_URL}/events/${this.zoomMeetingId}`)
      .addParam('join', true)
      .addParam('host', true).url;
  }

  @BeforeCreate()
  beforeCreate() {
    this.shortId = this.community.events.length + 10000;
  }
}
