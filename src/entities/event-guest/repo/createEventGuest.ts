import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import addGoogleCalendarEventAttendee from '@integrations/google/repo/addGoogleCalendarEventAttendee';
import Event from '../../event/Event';
import User from '../../user/User';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestArgs {
  @Field({ nullable: true })
  email?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}

/**
 * Returns a new EventGuest.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.memberId - Identifier of the member.
 * @param ctx.userId - Identifier of the user.
 */
const createEventGuest = async (
  { eventId, ...args }: CreateEventGuestArgs,
  { memberId, userId }: Pick<GQLContext, 'memberId' | 'userId'>
) => {
  const partialUser: Partial<User> = args.email
    ? { ...args }
    : await new BloomManager().findOne(
        User,
        { id: userId },
        { fields: ['email', 'firstName', 'lastName'] }
      );

  const baseArgs: FilterQuery<EventGuest> = {
    email: partialUser.email,
    event: { id: eventId },
    member: { id: memberId }
  };

  const existingGuest = await new BloomManager().findOne(EventGuest, baseArgs);

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest: EventGuest = await new BloomManager().createAndFlush(
    EventGuest,
    { ...baseArgs, ...partialUser },
    { event: 'CREATE_EVENT_GUEST', populate: ['member.user'] }
  );

  // If the event is updating only b/c of the googleCalendarEventId, don't
  // update the Google Calendar event. Otherwise, update the Google Calendar
  // event.
  setTimeout(async () => {
    const bm = new BloomManager();

    const [event, user] = await Promise.all([
      bm.findOne(Event, { id: eventId }),
      bm.findOne(User, { id: userId })
    ]);

    if (!event.googleCalendarEventId) return;

    await addGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      displayName: user.fullName,
      email: user.email,
      responseStatus: 'accepted'
    });
  }, 0);

  return guest;
};

export default createEventGuest;
