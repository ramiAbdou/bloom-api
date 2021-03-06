import day, { Dayjs } from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import Payment from '@entities/payment/Payment';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { TimeSeriesData } from '@util/constants.gql';

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @param ctx.communityId - ID of the Community.
 *
 * @example
 * // Returns [
 * // { name: '2021-01-16T00:00:00Z', value: 100 },
 * // { name: '2021-01-17T00:00:00Z', value: 150 },
 * // { name: '2021-01-18T00:00:00Z', value: 200 },
 * // ]
 * getPaymentsSeries()
 */
const getPaymentsSeries = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<TimeSeriesData[]> => {
  const { communityId } = ctx;

  const cacheKey = `${QueryEvent.GET_PAYMENTS_SERIES}-${communityId}`;

  if (Payment.cache.has(cacheKey)) {
    return Payment.cache.get(cacheKey);
  }

  const startOfLastMonth: Dayjs = day.utc().subtract(1, 'month').startOf('d');

  const payments = await new BloomManager().find(Payment, {
    community: communityId,
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
        .reduce((acc: number, payment: Payment) => {
          return acc + Number(payment.amount);
        }, 0);

      return { name: dateKey, value: totalAmount };
    })
  );

  return result;
};

export default getPaymentsSeries;
