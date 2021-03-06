import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Payment from '../Payment';

const getAllPayments = async (ctx: Pick<GQLContext, 'communityId'>) => {
  const payments: Payment[] = await new BloomManager().find(
    Payment,
    { community: ctx.communityId },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${ctx.communityId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );

  return payments;
};

export default getAllPayments;
