import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import Community from './Community';
import getCommunities, { GetCommunitiesArgs } from './repo/getCommunities';
import getCommunity, { GetCommunityArgs } from './repo/getCommunity';

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
  async getCommunities(@Args() args: GetCommunitiesArgs): Promise<Community[]> {
    return getCommunities(args);
  }
}
