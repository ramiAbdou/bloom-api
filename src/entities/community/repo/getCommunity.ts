import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '../Community';

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  communityId?: string;
}

const getCommunity = async (
  args: GetCommunityArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Community> => {
  const communityId: string = args?.communityId ?? ctx.communityId;

  return new BloomManager().findOneOrFail(
    Community,
    { id: communityId },
    { cacheKey: `${QueryEvent.GET_COMMUNITY}-${communityId}` }
  );
};

export default getCommunity;
