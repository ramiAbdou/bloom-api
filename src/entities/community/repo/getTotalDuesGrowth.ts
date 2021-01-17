import day from 'dayjs';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from '../../member-payment/MemberPayment';

const getTotalDuesGrowth = async ({
  communityId
}: GQLContext): Promise<number> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();
  const endOfToday = day.utc().endOf('day');

  const paymentsThisYear = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: { $gte: endOfToday.subtract(1, 'year').format() }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const amountThisYear =
    paymentsThisYear.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  cache.set(cacheKey, amountThisYear);

  return amountThisYear;
};

export default getTotalDuesGrowth;
