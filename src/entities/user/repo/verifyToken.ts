import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { ErrorContext, ErrorType } from '@util/constants.errors';
import { VerifyEvent } from '@util/constants.events';
import { TokenArgs } from '@util/constants.gql';
import { decodeToken } from '@util/util';
import createEventAttendeeWithSupporter from '../../event-attendee/repo/createEventAttendeeWithSupporter';
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
  supporterId?: string;

  @Field({ nullable: true })
  userId?: string;
}

/**
 * Returns the VerifiedToken based on the VerifyEvent that is supplied.
 *
 * @param args.token - JWT token to decode and process.
 * @param ctx.res - Express response object.
 */
const verifyToken = async (
  args: TokenArgs,
  ctx: Pick<GQLContext, 'res'>
): Promise<VerifiedToken> => {
  const { token } = args;
  const { res } = ctx;

  const verifiedToken: VerifiedToken = decodeToken(token) ?? {};
  const { event, eventId, memberId, supporterId, userId } = verifiedToken;

  // if (event === VerifyEvent.JOIN_EVENT && memberId) {
  //   await createEventAttendeeWithMember({ eventId }, { memberId });
  // }

  if (event === VerifyEvent.JOIN_EVENT && supporterId) {
    await createEventAttendeeWithSupporter({ eventId, supporterId });
  }

  if (event === VerifyEvent.LOG_IN) {
    const accessToken: string = await refreshToken({ memberId, res, userId });

    if (!accessToken) {
      res.cookie(ErrorContext.LOGIN_ERROR, ErrorType.TOKEN_EXPIRED);
      return null;
    }
  }

  return verifiedToken;
};

export default verifyToken;
