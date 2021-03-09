import day from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import { ErrorType } from '@util/errors';
import createEventAttendee from './createEventAttendee';

@ArgsType()
export class CreateEventAttendeeFromGuestTokenArgs {
  @Field()
  guestId: string;
}

/**
 * Returns true if the EventGuest was successfully able to join the Event.
 * If successful, an EventAttendee will be created.
 *
 * @param args.guestId - ID of the EventGuest.
 */
const createEventAttendeeFromGuestToken = async (
  args: CreateEventAttendeeFromGuestTokenArgs
): Promise<boolean> => {
  const { guestId } = args;

  const guest: EventGuest = await new BloomManager().findOne(
    EventGuest,
    guestId,
    { populate: ['event', 'member'] }
  );

  const { endTime, id: eventId, startTime } = guest?.event ?? {};
  const { community, id: memberId } = guest?.member ?? {};

  // In order to join the event, we need the
  if (!guest) throw new Error('Failed to join event.');

  const isValid: boolean = day
    .utc()
    .isAfter(day.utc(startTime).subtract(10, 'minute'));

  if (day.utc().isBefore(day.utc(startTime).subtract(10, 'minute'))) {
    throw new Error(ErrorType.EVENT_HASNT_STARTED);
  }

  if (day.utc().isAfter(day.utc(endTime).add(10, 'minute'))) {
    throw new Error(ErrorType.EVENT_FINISHED);
  }

  if (isValid) {
    await createEventAttendee(
      { eventId },
      { communityId: community.id, memberId }
    );
  }

  return !!guest;
};

export default createEventAttendeeFromGuestToken;
