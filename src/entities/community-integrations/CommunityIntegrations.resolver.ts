import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from './CommunityIntegrations';
import updateIntegrations, {
  UpdateIntegrationsArgs
} from './repo/updateIntegrations';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Authorized('ADMIN')
  @Query(() => CommunityIntegrations, { nullable: true })
  async getIntegrations(
    @Ctx() { communityId }: GQLContext
  ): Promise<CommunityIntegrations> {
    return new BloomManager().findOne(
      CommunityIntegrations,
      { community: { id: communityId } },
      { cacheKey: `${QueryEvent.GET_INTEGRATIONS}-${communityId}` }
    );
  }

  @Authorized('ADMIN')
  @Mutation(() => CommunityIntegrations)
  async updateIntegrations(
    @Args() args: UpdateIntegrationsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return updateIntegrations(args, ctx);
  }
}
