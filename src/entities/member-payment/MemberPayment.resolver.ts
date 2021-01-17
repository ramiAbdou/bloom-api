import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../member/Member';
import MemberPayment from './MemberPayment';
import createLifetimePayment, {
  CreateLifetimePaymentArgs
} from './repo/createLifetimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async createLifetimePayment(
    @Args() args: CreateLifetimePaymentArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createLifetimePayment(args, ctx);
  }

  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async createSubscription(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createSubscription(args, ctx);
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
}
