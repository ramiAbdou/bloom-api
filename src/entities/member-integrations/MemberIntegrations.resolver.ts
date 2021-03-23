import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberIntegrations from './MemberIntegrations';
import getChangePreview, {
  GetChangePreviewArgs,
  GetChangePreviewResult
} from './repo/getChangePreview';
import getMemberIntegrations from './repo/getMemberIntegrations';
import updateStripePaymentMethodId, {
  UpdateStripePaymentMethodIdArgs
} from './repo/updateStripePaymentMethodId';
import updateStripeSubscriptionId, {
  UpdateStripeSubscriptionIdArgs
} from './repo/updateStripeSubscriptionId';

@Resolver()
export default class MemberIntegrationsResolver {
  @Authorized()
  @Query(() => GetChangePreviewResult, { nullable: true })
  async getChangePreview(
    @Args() args: GetChangePreviewArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetChangePreviewResult> {
    return getChangePreview(args, ctx);
  }

  @Authorized()
  @Query(() => [MemberIntegrations])
  async getMemberIntegrations(
    @Ctx() ctx: GQLContext
  ): Promise<MemberIntegrations[]> {
    return getMemberIntegrations(ctx);
  }

  @Authorized()
  @Mutation(() => MemberIntegrations, { nullable: true })
  async updateStripePaymentMethodId(
    @Args() args: UpdateStripePaymentMethodIdArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberIntegrations> {
    return updateStripePaymentMethodId(args, ctx);
  }

  @Authorized()
  @Mutation(() => MemberIntegrations, { nullable: true })
  async updateStripeSubscriptionId(
    @Args() args: UpdateStripeSubscriptionIdArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberIntegrations> {
    return updateStripeSubscriptionId(args, ctx);
  }
}
