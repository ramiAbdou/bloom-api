import day from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import createEventAttendee from '@entities/event-attendee/repo/createEventAttendee';
import { ErrorType } from '@util/errors';
import EventGuest from '../EventGuest';

@ArgsType()
export class JoinEventArgs {
  @Field()
  guestId: string;
}

/**
 * @param {JoinEventArgs} args
 * @param {string} args.guestId - ID of the EventGuest.
 */
const joinEventViaToken = async (args: JoinEventArgs): Promise<boolean> => {
  const { guestId } = args;

  if (!guestId) throw new Error('guestId was not supplied.');

  const guest: EventGuest = await new BloomManager().findOne(
    EventGuest,
    guestId,
    { populate: ['event', 'member'] }
  );

  const isValid: boolean =
    guest && day().isAfter(day(guest.event?.startTime).subtract(10, 'minute'));

  if (
    guest &&
    day().isBefore(day(guest.event?.startTime).subtract(10, 'minute'))
  ) {
    throw new Error(ErrorType.EVENT_HASNT_STARTED);
  }

  if (guest && day().isAfter(day(guest.event?.endTime).add(10, 'minute'))) {
    throw new Error(ErrorType.EVENT_FINISHED);
  }

  if (isValid) {
    await createEventAttendee(
      { eventId: guest.event.id },
      { communityId: guest.member.community.id, memberId: guest.member.id }
    );
  }

  return !!guest;
};

export default joinEventViaToken;
