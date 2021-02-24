import day from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import createEventAttendee from '@entities/event-attendee/repo/createEventAttendee';
import { decodeToken } from '@util/util';
import EventGuest from '../EventGuest';

@ArgsType()
export class VerifyEventJoinTokenArgs {
  @Field()
  token: string;
}

const verifyEventJoinToken = async ({
  token
}: VerifyEventJoinTokenArgs): Promise<boolean> => {
  const guestId: string = decodeToken(token)?.guestId;

  const guest: EventGuest = await new BloomManager().findOne(
    EventGuest,
    { id: guestId },
    { populate: ['event', 'member'] }
  );

  const isValid: boolean =
    guest && day().isAfter(day(guest.event?.startTime).subtract(10, 'minute'));

  if (isValid) {
    await createEventAttendee(
      { eventId: guest.event.id },
      { memberId: guest.member.id, userId: guest.member.user.id }
    );
  }

  return isValid;
};

export default verifyEventJoinToken;
