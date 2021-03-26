import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import Community from '../Community';

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  urlName?: string;
}

/**
 * Returns the Community.
 *
 * @param args.urlName - URL name of the Community.
 * @param ctx.communityId - ID of the Community.
 */
const getCommunity = async (
  args: GetCommunityArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Community> => {
  const queryArgs: FilterQuery<Community> = args.urlName
    ? { urlName: args.urlName }
    : { id: ctx.communityId };

  const key: string = args.urlName ?? ctx.communityId;

  const community: Community = await new BloomManager().findOneOrFail(
    Community,
    queryArgs,
    { cacheKey: `${QueryEvent.GET_COMMUNITIES}-${key}` }
  );

  return community;
};

export default getCommunity;
