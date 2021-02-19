import day from 'dayjs';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { MemberStatus } from '@entities/member/Member.types';
import { TimeSeriesData } from '@util/gql';
import Member from '../../member/Member';

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @example getTotalGrowthSeries() => [
 *  { name: '2021-01-16T00:00:00Z', value: 100 },
 *  { name: '2021-01-17T00:00:00Z', value: 150 },
 *  { name: '2021-01-18T00:00:00Z', value: 200 },
 * ]
 */
const getTotalGrowthSeries = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<TimeSeriesData[]> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_MEMBERS_SERIES}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const members = await new BloomManager().find(Member, {
    community: { id: communityId },
    status: MemberStatus.ACCEPTED
  });

  const endOfToday = day.utc().endOf('day');

  // Build an array of member count over the last 90 days.
  const result: TimeSeriesData[] = await Promise.all(
    Array.from(Array(90).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(90 - i - 1, 'd').format();

      const numMembers = members.filter(({ createdAt, deletedAt }) => {
        return createdAt < dateKey && (!deletedAt || deletedAt >= dateKey);
      }).length;

      return { name: dateKey, value: numMembers };
    })
  );

  return result;
};

export default getTotalGrowthSeries;
