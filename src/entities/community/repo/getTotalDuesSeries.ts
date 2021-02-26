import day from 'dayjs';

import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import { TimeSeriesData } from '@util/gql';
import MemberPayment from '@entities/member-payment/MemberPayment';

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @example getTotalDuesSeries() => [
 *  { name: '2021-01-16T00:00:00Z', value: 100 },
 *  { name: '2021-01-17T00:00:00Z', value: 150 },
 *  { name: '2021-01-18T00:00:00Z', value: 200 },
 * ]
 */
const getTotalDuesSeries = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<TimeSeriesData[]> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_DUES_SERIES}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const startOfLastMonth = day.utc().subtract(1, 'month').startOf('d');

  const payments = await new BloomManager().find(MemberPayment, {
    community: { id: communityId },
    createdAt: { $gte: startOfLastMonth.format() }
  });

  const endOfToday = day.utc().endOf('day');

  // Build an array of member count over the last 90 days.
  const result: TimeSeriesData[] = await Promise.all(
    Array.from(Array(30).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(30 - i - 1, 'd').format();

      const totalAmount: number = payments
        .filter(({ createdAt }) => createdAt < dateKey)
        .reduce((acc: number, { amount }) => acc + amount, 0);

      return { name: dateKey, value: totalAmount };
    })
  );

  return result;
};

export default getTotalDuesSeries;
