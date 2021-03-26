import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import Payment from './Payment';
import getPaymentsSeries from './repo/getPaymentsSeries';
import listPayments, { ListPaymentsArgs } from './repo/listPayments';

@Resolver()
export default class PaymentResolver {
  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getPaymentsSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getPaymentsSeries(ctx);
  }

  @Authorized()
  @Query(() => [Payment])
  async listPayments(@Args() args: ListPaymentsArgs): Promise<Payment[]> {
    return listPayments(args);
  }
}
