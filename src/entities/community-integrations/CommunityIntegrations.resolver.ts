import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import CommunityIntegrations from './CommunityIntegrations';
import getIntegrations from './repo/getIntegrations';
import updateMailchimpListId, {
  UpdateMailchimpListIdArgs
} from './repo/updateMailchimpListId';

@Resolver()
export default class CommunityIntegrationsResolver {
  @Query(() => CommunityIntegrations, { nullable: true })
  async getIntegrations(
    @Ctx() args: GQLContext
  ): Promise<CommunityIntegrations> {
    return getIntegrations(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => CommunityIntegrations)
  async updateMailchimpListId(
    @Args() args: UpdateMailchimpListIdArgs,
    @Ctx() ctx: GQLContext
  ) {
    return updateMailchimpListId(args, ctx);
  }
}
