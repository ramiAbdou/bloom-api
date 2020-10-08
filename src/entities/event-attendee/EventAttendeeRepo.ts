/**
 * @fileoverview Repository: EventAttendee
 * @author Rami Abdou
 */

import { EntityRepository, Repository } from 'mikro-orm';

import { Event, Membership, User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import EventAttendee from './EventAttendee';

@Repository(EventAttendee)
export default class EventAttendeeRepo extends EntityRepository<EventAttendee> {
  bm: BloomManager = new BloomManager(this.em);

  /**
   * Creates an EventAttendee based on the membership given by the userId and
   * the community that the event is hosted in.
   */
  joinEventAsUser = async (eventId: string, userId: string) => {
    const user: User = await this.bm.userRepo().findOne({ id: userId });
    const event: Event = await this.bm.eventRepo().findOne({ id: eventId });
    const membership: Membership = await this.bm
      .membershipRepo()
      .findOne({ community: event.community, user });

    const attendee: EventAttendee = this.create({ event, membership });
    await this.bm.persistAndFlush(
      attendee,
      `${user.fullName} joined event ID: ${eventId}.`,
      attendee
    );
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
    const event: Event = await this.bm.eventRepo().findOne({ id: eventId });
    const attendee: EventAttendee = this.create({ email, event, fullName });

    await this.bm.persistAndFlush(
      attendee,
      `${fullName} (Guest) joined event ID: ${eventId}.`,
      attendee
    );
  };
}
