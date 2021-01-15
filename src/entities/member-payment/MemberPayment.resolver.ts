import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../member/Member';
import MemberPayment from './MemberPayment';
import createOneTimePayment, {
  CreateOneTimePaymentArgs
} from './repo/createOneTimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getDuesInformation, {
  GetDuesInformationResult
} from './repo/getDuesInformation';
import getTotalDuesCollected, {
  GetTotalDuesCollectedResult
} from './repo/getTotalDuesCollected';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async createOneTimePayment(
    @Args() args: CreateOneTimePaymentArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createOneTimePayment(args, ctx);
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
  @Query(() => GetDuesInformationResult)
  async getDuesInformation(@Ctx() ctx: GQLContext) {
    return getDuesInformation(ctx);
  }

  @Authorized()
  @Query(() => [MemberPayment])
  async getPaymentHistory(@Ctx() { memberId }: GQLContext) {
    return new BloomManager().find(
      MemberPayment,
      { member: { id: memberId } },
      {
        cacheKey: `${QueryEvent.GET_PAYMENT_HISTORY}-${memberId}`,
        orderBy: { createdAt: QueryOrder.DESC },
        populate: ['member']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => GetTotalDuesCollectedResult)
  async getTotalDuesCollected(@Ctx() ctx: GQLContext) {
    return getTotalDuesCollected(ctx);
  }
}
