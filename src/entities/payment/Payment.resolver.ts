import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import getPaymentsSeries from './repo/getPaymentsSeries';

@Resolver()
export default class PaymentResolver {
  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getPaymentsSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getPaymentsSeries(ctx);
  }
}
