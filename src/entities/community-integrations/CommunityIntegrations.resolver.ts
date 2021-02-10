import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from './CommunityIntegrations';
import updateMailchimpList from './repo/updateMailchimpList';

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
      {
        cacheKey: `${QueryEvent.GET_INTEGRATIONS}-${communityId}`,
        populate: ['community']
      }
    );
  }

  @Authorized('ADMIN')
  @Mutation(() => CommunityIntegrations, { nullable: true })
  async updateMailchimpListId(
    @Arg('mailchimpListId') mailchimpListId: string,
    @Ctx() ctx: GQLContext
  ) {
    return updateMailchimpList(mailchimpListId, ctx);
  }
}
