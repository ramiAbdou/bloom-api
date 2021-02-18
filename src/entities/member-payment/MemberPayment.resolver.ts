import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from './MemberPayment';
import createLifetimePayment, {
  CreateLifetimePaymentArgs
} from './repo/createLifetimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getMemberPayments, {
  GetMemberPaymentsArgs
} from './repo/getMemberPayments';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => MemberPayment, { nullable: true })
  async createLifetimePayment(
    @Args() args: CreateLifetimePaymentArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberPayment> {
    return createLifetimePayment(args, ctx);
  }

  @Authorized()
  @Mutation(() => MemberPayment, { nullable: true })
  async createSubscription(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberPayment> {
    return createSubscription(args, ctx);
  }

  @Authorized()
  @Query(() => [MemberPayment])
  async getMemberPayments(
    @Args() args: GetMemberPaymentsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return getMemberPayments(args, ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [MemberPayment], { nullable: true })
  async getPayments(
    @Ctx() { communityId }: GQLContext
  ): Promise<MemberPayment[]> {
    return new BloomManager().find(
      MemberPayment,
      { community: { id: communityId } },
      {
        cacheKey: `${QueryEvent.GET_PAYMENTS}-${communityId}`,
        populate: ['member.user']
      }
    );
  }
}
