import { ArgsType, Field } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import Payment from '../Payment';

@ArgsType()
export class GetPaymentsArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the Payment(s).
 *
 * @param args.communityId - ID of the Community.
 * @param args.memberId - ID of the Member.
 */
const getPayments = async (args: GetPaymentsArgs): Promise<Payment[]> => {
  const { communityId, memberId } = args;

  const queryArgs: FilterQuery<Payment> = communityId
    ? { community: communityId }
    : { member: memberId };

  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { ...queryArgs },
    {
      cacheKey: communityId
        ? `${QueryEvent.GET_PAYMENTS}-${communityId}`
        : `${QueryEvent.GET_PAYMENTS}-${memberId}`,
      orderBy: { createdAt: QueryOrder.DESC }
    }
  );

  return payments;
};

export default getPayments;
