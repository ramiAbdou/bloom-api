import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Supporter from '@entities/supporter/Supporter';
import User from '@entities/user/User';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { EmailEvent, GoogleEvent } from '@util/constants.events';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestWithSupporterArgs {
  @Field()
  email: string;

  @Field()
  eventId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

/**
 * Returns a new EventGuest with the Supporter populated.
 *
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.eventId - ID of the Event.
 */
const createEventGuestWithSupporter = async (
  args: CreateEventGuestWithSupporterArgs
): Promise<EventGuest> => {
  const { email, eventId, firstName, lastName } = args;

  const bm: BloomManager = new BloomManager();

  const event: Event = await bm.em.findOne(Event, { id: eventId });

  const [user]: [User, boolean] = await bm.findOneOrCreate(
    User,
    { email },
    { email }
  );

  const [supporter]: [Supporter, boolean] = await bm.findOneOrCreate(
    Supporter,
    { community: event.community.id, email },
    { community: event.community.id, email, firstName, lastName, user }
  );

  const existingGuest: EventGuest = await bm.em.findOne(
    EventGuest,
    { event: eventId, member: null, supporter },
    { populate: ['supporter'] }
  );

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest: EventGuest = await bm.createAndFlush(
    EventGuest,
    { event: eventId, supporter },
    { populate: ['supporter'] }
  );

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { communityId: event.community.id, eventId, guestId: guest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId,
    guestId: guest.id
  });

  return guest;
};

export default createEventGuestWithSupporter;
