import { Field, ObjectType } from 'type-graphql';

import { AuthTokens, GQLContext } from '@util/constants';
import { ErrorContext, ErrorType } from '@util/constants.errors';
import { VerifyEvent } from '@util/constants.events';
import { TokenArgs } from '@util/constants.gql';
import { decodeToken } from '@util/util';
import createEventAttendee from '../../event-attendee/repo/createEventAttendee';
import refreshToken from './refreshToken';

@ObjectType()
export class VerifiedToken {
  @Field(() => String, { nullable: true })
  event?: VerifyEvent;

  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  userId?: string;
}

/**
 * Returns the VerifiedToken based on the VerifyEvent that is supplied.
 *
 * @param args.event - VerifyEvent to process.
 * @param args.guestId - ID of the EventGuest.
 * @param args.memberId - ID of the Member.
 * @param args.userId - ID of the User.
 * @param ctx.res - Express response object.
 */
const verifyToken = async (
  args: TokenArgs,
  ctx: Pick<GQLContext, 'res'>
): Promise<VerifiedToken> => {
  const { token } = args;
  const { res } = ctx;

  const verifiedToken: VerifiedToken = decodeToken(token) ?? {};
  const { event, eventId, memberId, userId } = verifiedToken;

  if (event === VerifyEvent.JOIN_EVENT) {
    await createEventAttendee({ eventId }, { memberId });
  }

  if (event === VerifyEvent.LOG_IN) {
    const tokens: AuthTokens = await refreshToken({ memberId, res, userId });

    if (!tokens) {
      res.cookie(ErrorContext.LOGIN_ERROR, ErrorType.TOKEN_EXPIRED);
      return null;
    }
  }

  return verifiedToken;
};

export default verifyToken;
