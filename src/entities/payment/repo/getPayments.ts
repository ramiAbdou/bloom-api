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
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const memberId = args?.memberId ?? ctx.memberId;
  const key = args?.memberId ?? ctx.communityId;

  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { community: ctx.communityId, member: memberId },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${key}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );

  return payments;
};

export default getPayments;
