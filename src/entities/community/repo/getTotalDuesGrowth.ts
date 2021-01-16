import day from 'dayjs';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from '../../member-payment/MemberPayment';

const getTotalDuesGrowth = async ({ communityId }: GQLContext) => {
  const cacheKey = `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();
  const endOfToday = day.utc().endOf('day');
  const startOf30DaysAgo = day.utc().subtract(30, 'day').startOf('d');
  const startOf60DaysAgo = day.utc().subtract(60, 'day').startOf('d');

  const paymentsLastMonth = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: {
        $gte: startOf60DaysAgo.format(),
        $lt: startOf30DaysAgo.format()
      }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const paymentsAfterMonthAgo = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: { $gte: endOfToday.subtract(1, 'month').format() }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const paymentsAfterYearAgo = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: { $gte: endOfToday.subtract(1, 'year').format() }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const amountLastMonth =
    paymentsLastMonth.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  const paymentsThisMonth =
    paymentsAfterMonthAgo.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  const amountThisYear =
    paymentsAfterYearAgo.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  const growthRatio = paymentsThisMonth / (amountLastMonth || 1);

  const growthPercentage = Number(
    ((!growthRatio ? 0 : growthRatio - 1) * 100).toFixed(1)
  );

  const result = [amountThisYear, growthPercentage];
  cache.set(cacheKey, result);

  return result;
};

export default getTotalDuesGrowth;
