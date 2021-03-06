import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Payment from '../Payment';

@ArgsType()
export class GetPaymentsArgs {
  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the Payment(s) of a Member.
 *
 * @param args.memberId - ID of the Member.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getPayments = async (
  args: GetPaymentsArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<Payment[]> => {
  const memberId: string = args.memberId ?? ctx.memberId;

  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { member: memberId },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${memberId}`,
      orderBy: { createdAt: QueryOrder.DESC }
    }
  );

  return payments;
};

export default getPayments;
