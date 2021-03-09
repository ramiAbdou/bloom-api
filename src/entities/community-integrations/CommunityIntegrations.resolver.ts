import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import CommunityIntegrations from './CommunityIntegrations';
import getIntegrations, { GetIntegrationsArgs } from './repo/getIntegrations';
import updateMailchimpListId, {
  UpdateMailchimpListIdArgs
} from './repo/updateMailchimpListId';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Query(() => CommunityIntegrations)
  async getIntegrations(
    @Args() args: GetIntegrationsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<CommunityIntegrations> {
    return getIntegrations(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => CommunityIntegrations)
  async updateMailchimpListId(
    @Args() args: UpdateMailchimpListIdArgs,
    @Ctx() ctx: GQLContext
  ): Promise<CommunityIntegrations> {
    return updateMailchimpListId(args, ctx);
  }
}
