import { Field, ObjectType } from 'type-graphql';

import { AuthTokens, GQLContext } from '@util/constants';
import { VerifyEvent } from '@util/events';
import { TokenArgs } from '@util/gql';
import { decodeToken } from '@util/util';
import joinEventViaToken from '../../event-attendee/repo/createEventAttendeeFromGuestToken';
import refreshToken from './refreshToken';

@ObjectType()
export class VerifiedToken {
  @Field(() => String, { nullable: true })
  event?: VerifyEvent;

  @Field({ nullable: true })
  guestId?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  userId?: string;
}

const verifyToken = async (
  args: TokenArgs,
  ctx: Pick<GQLContext, 'res'>
): Promise<VerifiedToken> => {
  const { token } = args;
  const { res } = ctx;

  const verifiedToken: VerifiedToken = decodeToken(token) ?? {};
  const { event, guestId, memberId, userId } = verifiedToken;

  let tokens: AuthTokens;

  if (event === VerifyEvent.JOIN_EVENT) {
    await joinEventViaToken({ guestId });
  }

  if ([VerifyEvent.LOG_IN].includes(event)) {
    tokens = await refreshToken({ memberId, res, userId });
  }

  if (event === VerifyEvent.LOG_IN && !tokens) {
    res.cookie('LOGIN_LINK_ERROR', 'TOKEN_EXPIRED');
    return null;
  }

  return verifiedToken;
};

export default verifyToken;
