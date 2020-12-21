import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import CommunityIntegrations from './CommunityIntegrations';
import updateMailchimpList from './repo/updateMailchimpList';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Authorized('ADMIN')
  @Mutation(() => CommunityIntegrations, { nullable: true })
  async updateMailchimpListId(
    @Arg('mailchimpListId') mailchimpListId: string,
    @Ctx() ctx: GQLContext
  ) {
    return updateMailchimpList(mailchimpListId, ctx);
  }
}
