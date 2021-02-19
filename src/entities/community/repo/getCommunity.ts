import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
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
