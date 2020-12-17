import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from './CommunityIntegrations';
import updateMailchimpList from './repo/updateMailchimpList';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Authorized()
  @Query(() => String, { nullable: true })
  async getStripeAccountId(@Ctx() { communityId }: GQLContext) {
    const integrations = await new BloomManager().findOne(
      CommunityIntegrations,
      { community: { id: communityId } }
    );

    return integrations.stripeAccountId;
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
