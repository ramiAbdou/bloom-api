import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import MemberRefresh from '../../member-refresh/MemberRefresh';
import { TimeSeriesData } from '../Member.types';

@ObjectType()
export class GetActiveMemberAnalyticsResult {
  // Represents 90 data points representing the number of members in the
  // organization on any given day.
  @Field(() => [TimeSeriesData])
  activeChartData: TimeSeriesData[];

  // Percentage points of growth in the number of members over the last 30 days.
  @Field()
  activeGrowth: number;
}

export default async ({
  communityId
}: GQLContext): Promise<GetActiveMemberAnalyticsResult> => {
  const cacheKey = `${QueryEvent.GET_ACTIVE_MEMBER_ANALYTICS}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();
  const startOfToday = day.utc().startOf('day');
  const endOfToday = day.utc().endOf('day');

  const refreshes: MemberRefresh[] = await bm.find(MemberRefresh, {
    createdAt: { $gte: endOfToday.subtract(90, 'd').format() },
    member: { community: { id: communityId } }
  });

  // Build an array of member count over the last 120 days.
  const activeChartData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(90).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(90 - i - 1, 'd').format();
      const startKey = startOfToday.subtract(90 - i - 1, 'd').format();

      const value = refreshes.filter(
        ({ createdAt }) => createdAt >= startKey && createdAt <= dateKey
      ).length;

      return { name: dateKey, value };
    })
  );

  // To calculate the totalGrowth, we do a simple subtraction of the count
  // over the last 30 days.
  const { length } = activeChartData;
  const lastTally = activeChartData[length - 1].value;
  const thirtyDaysAgoTally = activeChartData[length - 30 - 1].value;

  const activeGrowth = parseFloat(
    (((lastTally - thirtyDaysAgoTally) / (lastTally || 1)) * 100).toFixed(1)
  );

  const result: GetActiveMemberAnalyticsResult = {
    activeChartData,
    activeGrowth
  };

  cache.set(cacheKey, result);
  return result;
};
