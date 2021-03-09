import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/gql';
import Payment from './Payment';
import createLifetimePayment, {
  CreateLifetimePaymentArgs
} from './repo/createLifetimePayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getPayments, { GetPaymentsArgs } from './repo/getPayments';
import getPaymentsSeries from './repo/getPaymentsSeries';

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

  @Authorized()
  @Query(() => [Payment])
  async getPayments(@Args() args: GetPaymentsArgs): Promise<Payment[]> {
    return getPayments(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getPaymentsSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getPaymentsSeries(ctx);
  }
}
