import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from './MemberPayment';
import createLifetimePayment, {
  CreateLifetimePaymentArgs
} from './repo/createLifetimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getUpcomingPayment, {
  GetUpcomingPaymentResult
} from './repo/getUpcomingPayment';

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
  @Query(() => GetChangePreviewResult, { nullable: true })
  async getChangePreview(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetChangePreviewResult> {
    return getChangePreview(args, ctx);
  }

  @Authorized()
  @Query(() => [MemberPayment])
  async getMemberPayments(@Ctx() { memberId }: GQLContext) {
    return new BloomManager().find(
      MemberPayment,
      { member: { id: memberId } },
      {
        cacheKey: `${QueryEvent.GET_MEMBER_PAYMENTS}-${memberId}`,
        orderBy: { createdAt: QueryOrder.DESC },
        populate: ['member']
      }
    );
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
        populate: ['community', 'member.user', 'type']
      }
    );
  }

  @Authorized()
  @Query(() => GetUpcomingPaymentResult, { nullable: true })
  async getUpcomingPayment(
    @Ctx() ctx: GQLContext
  ): Promise<GetUpcomingPaymentResult> {
    return getUpcomingPayment(ctx);
  }
}
