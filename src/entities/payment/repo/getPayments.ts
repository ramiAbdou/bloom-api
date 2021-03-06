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

const getPayments = async (
  args: GetPaymentsArgs,
  ctx: Pick<GQLContext, 'memberId'>
) => {
  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { member: args?.memberId ?? ctx?.memberId },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${args?.memberId ?? ctx?.memberId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );

  return payments;
};

export default getPayments;
