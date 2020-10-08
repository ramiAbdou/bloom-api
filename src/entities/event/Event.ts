/**
 * @fileoverview Entity: Event
 * @author Rami Abdou
 */

import { IsUrl } from 'class-validator';
import { Collection, Entity, ManyToOne, OneToMany, Property } from 'mikro-orm';

import { APP } from '@constants';
import { Community } from '@entities/entities';
import BaseEntity from '@util/db/BaseEntity';
import URLBuilder from '@util/URLBuilder';
import EventAttendee from '../event-attendee/EventAttendee';
import EventRSVP from '../event-rsvp/EventRSVP';

@Entity()
export default class Event extends BaseEntity {
  /**
   * @example
   * """ If you're interested in pursuing a Software Engineering Internship,
   * RSVP on Jumpstart for our event with them next week! You’ll get a chance to
   * meet their team, ask questions about the application process, and more...
   * """
   */
  @Property({ type: 'text' })
  description: string;

  @Property()
  endTime: string;

  @Property()
  startTime: string;

  /**
   * @example ColorStack x Facebook: Day in the Life of a Software Engineer
   */
  @Property()
  topic: string;

  @Property()
  zoomMeetingId: string;

  // Should ONLY be used by the host of the meeting. This URL will effectively
  // start the Zoom meeting.
  @Property({ nullable: true })
  @IsUrl()
  zoomHostUrl: string;

  // URL for participants to join the meeting.
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
}
