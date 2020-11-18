/**
 * @fileoverview Resolver: CommunityIntegrations
 * @author Rami Abdou
 */

import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async updateMailchimpListId(
    @Arg('mailchimpListId') mailchimpListId: string,
    @Ctx() { communityId }: GQLContext
  ) {
    await new BloomManager()
      .communityIntegrationsRepo()
      .updateMailchimpListId(communityId, mailchimpListId);
  }
}
