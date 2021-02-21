import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import CommunityIntegrations from './CommunityIntegrations';
import updateMailchimpListId, {
  UpdateMailchimpListIdArgs
} from './repo/updateMailchimpListId';

@Resolver()
export default class CommunityIntegrationsResolver {
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
  async updateMailchimpListId(
    @Args() args: UpdateMailchimpListIdArgs,
    @Ctx() ctx: GQLContext
  ) {
    return updateMailchimpListId(args, ctx);
  }
}
