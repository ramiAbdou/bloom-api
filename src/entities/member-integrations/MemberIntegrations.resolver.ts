import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { CreateSubsciptionArgs } from '../payment/repo/createSubscription';
import MemberIntegrations from './MemberIntegrations';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getUpcomingPayment, {
  GetUpcomingPaymentResult
} from './repo/getUpcomingPayment';
import updatePaymentMethod, {
  UpdatePaymentMethodArgs
} from './repo/updatePaymentMethod';

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
  @Query(() => GetUpcomingPaymentResult, { nullable: true })
  async getUpcomingPayment(
    @Ctx() ctx: GQLContext
  ): Promise<GetUpcomingPaymentResult> {
    return getUpcomingPayment(ctx);
  }

  @Authorized()
  @Mutation(() => MemberIntegrations, { nullable: true })
  async updatePaymentMethod(
    @Args() args: UpdatePaymentMethodArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberIntegrations> {
    return updatePaymentMethod(args, ctx);
  }
}
