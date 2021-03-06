import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Payment from './Payment';
import createLifetimePayment, {
  CreateLifetimePaymentArgs
} from './repo/createLifetimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getAllPayments from './repo/getAllPayments';
import getPayments, { GetPaymentsArgs } from './repo/getPayments';

@Resolver()
export default class PaymentResolver {
  @Authorized()
  @Mutation(() => Payment, { nullable: true })
  async createLifetimePayment(
    @Args() args: CreateLifetimePaymentArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Payment> {
    return createLifetimePayment(args, ctx);
  }

  @Authorized()
  @Mutation(() => Payment, { nullable: true })
  async createSubscription(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Payment> {
    return createSubscription(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Payment])
  async getAllPayments(@Ctx() ctx: GQLContext): Promise<Payment[]> {
    return getAllPayments(ctx);
  }

  @Authorized()
  @Query(() => [Payment])
  async getPayments(
    @Args() args: GetPaymentsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Payment[]> {
    return getPayments(args, ctx);
  }
}
