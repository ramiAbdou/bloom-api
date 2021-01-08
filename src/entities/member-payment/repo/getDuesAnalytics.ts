import day from 'dayjs';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { TimeSeriesData } from '../../member/Member.types';
import MemberPayment from '../MemberPayment';

const getDuesAnalytics = async ({ communityId }: GQLContext) => {
  const cacheKey = `${QueryEvent.GET_DUES_ANALYTICS}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();
  const startOfToday = day.utc().startOf('day');
  const endOfToday = day.utc().endOf('day');

  const paymentsBefore90DaysAgo: MemberPayment[] = await bm.find(
    MemberPayment,
    {
      createdAt: { $gte: endOfToday.subtract(90, 'd').format() },
      member: { community: { id: communityId } }
    }
  );

  const totalBefore90DaysAgo: number = paymentsBefore90DaysAgo.reduce(
    (acc: number, { amount }: MemberPayment) => {
      return acc + amount / 100;
    },
    0
  );

  const paymentsAfter30DaysAgo: MemberPayment[] = await bm.find(MemberPayment, {
    createdAt: { $gte: startOfToday.subtract(30, 'd').format() },
    member: { community: { id: communityId } }
  });

  // Build an array of member count over the last 90 days.
  const duesData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(90).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const endKey = endOfToday.subtract(90 - i - 1, 'd').format();
      const startKey = startOfToday.subtract(90 - i - 1, 'd').format();

      const total = paymentsAfter30DaysAgo.reduce(
        (acc: number, { amount, createdAt }: MemberPayment) => {
          if (createdAt < startKey && createdAt > endKey) return acc;
          return acc + amount / 100;
        },
        totalBefore90DaysAgo
      );

      return { name: endKey, value: total };
    })
  );

  cache.set(cacheKey, duesData);

  return duesData;
};

export default getDuesAnalytics;
