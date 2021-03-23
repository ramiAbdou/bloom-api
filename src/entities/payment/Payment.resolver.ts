import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import Payment from './Payment';
import getPayments, { GetPaymentsArgs } from './repo/getPayments';
import getPaymentsSeries from './repo/getPaymentsSeries';

@Resolver()
export default class PaymentResolver {
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
