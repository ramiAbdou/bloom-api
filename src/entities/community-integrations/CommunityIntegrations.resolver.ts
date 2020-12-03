import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';
import CommunityIntegrations from './CommunityIntegrations';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Authorized('ADMIN')
  @Mutation(() => CommunityIntegrations, { nullable: true })
  async updateMailchimpListId(
    @Arg('mailchimpListId') mailchimpListId: string,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager()
      .communityIntegrationsRepo()
      .updateMailchimpListId(communityId, mailchimpListId);
  }
}
