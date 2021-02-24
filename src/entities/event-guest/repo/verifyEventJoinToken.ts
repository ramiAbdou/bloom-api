import day from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { decodeToken } from '@util/util';
import refreshToken from '../../user/repo/refreshToken';
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
    { populate: ['event'] }
  );

  if (guest.member) {
    refreshToken({ email: guest.email, memberId: guest.member.id });
  }

  return (
    guest && day().isAfter(day(guest.event?.startTime).subtract(10, 'minute'))
  );
};

export default verifyEventJoinToken;
