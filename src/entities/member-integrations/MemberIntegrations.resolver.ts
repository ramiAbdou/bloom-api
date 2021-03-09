import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { CreateSubsciptionArgs } from '../payment/repo/createSubscription';
import MemberIntegrations from './MemberIntegrations';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getMemberIntegrations from './repo/getMemberIntegrations';
import updateStripePaymentMethodId, {
  UpdateStripePaymentMethodIdArgs
} from './repo/updateStripePaymentMethodId';

@Resolver()
export default class MemberIntegrationsResolver {
  @Authorized()
  @Query(() => GetChangePreviewResult, { nullable: true })
  async getChangePreview(
    @Args() args: CreateSubsciptionArgs,
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
}
