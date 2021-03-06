import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Payment from '../Payment';

/**
 * Returns the Payment(s) of a Community.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getAllPayments = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Payment[]> => {
  const { communityId } = ctx;

  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { community: communityId },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${communityId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );

  return payments;
};

export default getAllPayments;
