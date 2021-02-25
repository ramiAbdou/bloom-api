import { Field, ObjectType } from 'type-graphql';

import { AuthTokens, GQLContext } from '@constants';
import { VerifyEvent } from '@util/events';
import { TokenArgs } from '@util/gql';
import { decodeToken } from '@util/util';
import joinEventViaToken from '../../event-guest/repo/joinEventViaToken';
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
  const verifiedToken: VerifiedToken = decodeToken(args.token) ?? {};
  const { event, guestId, memberId, userId } = verifiedToken;

  let tokens: AuthTokens;

  if (event === VerifyEvent.JOIN_EVENT) {
    await joinEventViaToken({ guestId });
  }

  if ([VerifyEvent.LOG_IN].includes(event)) {
    tokens = await refreshToken({ memberId, res: ctx.res, userId });
  }

  if (event === VerifyEvent.LOG_IN && !tokens) {
    ctx.res.cookie('LOGIN_LINK_ERROR', 'TOKEN_EXPIRED');
    return null;
  }

  return verifiedToken;
};

export default verifyToken;
