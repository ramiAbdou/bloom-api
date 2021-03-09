import { ArgsType, Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { decodeToken } from '@util/util';
import refreshToken from './refreshToken';

@ArgsType()
export class GetTokensArgs {
  @Field({ nullable: true })
  urlName?: string;
}

@ObjectType()
export class GetTokensResult {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  memberId: string;

  @Field({ nullable: true })
  userId: string;
}

/**
 * Returns the communityId, memberId and userId from the decoded accessToken.
 * If the urlName is present and the active communityId does not match, we
 * refresh the token to be for that community (effectively switching
 * communities).
 *
 * @param args.urlName URL name of the community, if present.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 * @param ctx.res - Express response object.
 * @param ctx.userId - ID of the User (authenticated).
 */
const getTokens = async (
  args: GetTokensArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId' | 'res' | 'userId'>
): Promise<GetTokensResult> => {
  const { urlName } = args;
  const { communityId, memberId, res, userId } = ctx;

  if (!urlName) return { communityId, memberId, userId };

  const member: Member = await new BloomManager().findOne(Member, {
    community: { urlName },
    user: { id: userId }
  });

  if (member && member.community?.id !== communityId) {
    const tokens = await refreshToken({ memberId: member.id, res, userId });
    const decodedToken = decodeToken(tokens.accessToken);
    return decodedToken;
  }

  return { communityId, memberId, userId };
};

export default getTokens;
