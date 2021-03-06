import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Integrations from './Integrations';
import getIntegrations, { GetIntegrationsArgs } from './repo/getIntegrations';
import updateMailchimpListId, {
  UpdateMailchimpListIdArgs
} from './repo/updateMailchimpListId';

@Resolver()
export default class IntegrationsResolver {
  @Query(() => Integrations)
  async getIntegrations(
    @Args() args: GetIntegrationsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Integrations> {
    return getIntegrations(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Integrations)
  async updateMailchimpListId(
    @Args() args: UpdateMailchimpListIdArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Integrations> {
    return updateMailchimpListId(args, ctx);
  }
}
