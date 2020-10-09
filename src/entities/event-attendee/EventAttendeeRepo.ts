/**
 * @fileoverview Repository: EventAttendee
 * @author Rami Abdou
 */

import { Event, Membership, User } from '@entities';
import BaseRepo from '@util/db/BaseRepo';
import EventAttendee from './EventAttendee';

export default class EventAttendeeRepo extends BaseRepo<EventAttendee> {
  /**
   * Creates an EventAttendee based on the membership given by the userId and
   * the community that the event is hosted in.
   */
  joinEventAsUser = async (eventId: string, userId: string) => {
    const user: User = await this.userRepo().findOne({ id: userId });
    const event: Event = await this.eventRepo().findOne({ id: eventId });
    const membership: Membership = await this.membershipRepo().findOne({
      community: event.community,
      user
    });
    const attendee: EventAttendee = this.create({ event, membership });
    await this.persistAndFlush(attendee, 'JOINED_EVENT_AS_USER');
  };

  /**
   * Creates an EventAttendee based on the fullName and email that the guest
   * provides as a requirement for joining the event.
   */
  joinEventAsGuest = async (
    eventId: string,
    fullName: string,
    email: string
  ) => {
    const event: Event = await this.eventRepo().findOne({ id: eventId });
    const attendee: EventAttendee = this.create({ email, event, fullName });
    await this.persistAndFlush(attendee, 'JOINED_EVENT_AS_GUEST');
  };
}
