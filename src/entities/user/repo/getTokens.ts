import { ArgsType, Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { decodeToken } from '@util/util';
import Member from '../../member/Member';
import refreshToken from './refreshToken';

@ArgsType()
export class GetTokensArgs {
  @Field({ nullable: true })
  urlName?: string;
}

@ObjectType()
export class GetTokensResult {
  @Field()
  communityId: string;

  @Field()
  memberId: string;

  @Field()
  userId: string;
}

const getTokens = async (
  { urlName }: GetTokensArgs,
  {
    communityId,
    memberId,
    res,
    userId
  }: Pick<GQLContext, 'communityId' | 'memberId' | 'res' | 'userId'>
): Promise<GetTokensResult> => {
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
