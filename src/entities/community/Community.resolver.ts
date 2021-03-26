import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import Community from './Community';
import getCommunity, { GetCommunityArgs } from './repo/getCommunity';
import listCommunities, { ListCommunitiesArgs } from './repo/listCommunities';

@Resolver()
export default class CommunityResolver {
  @Query(() => Community)
  async getCommunity(
    @Args() args: GetCommunityArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Community> {
    return getCommunity(args, ctx);
  }

  @Authorized()
  @Query(() => [Community])
  async listCommunities(
    @Args() args: ListCommunitiesArgs
  ): Promise<Community[]> {
    return listCommunities(args);
  }
}
