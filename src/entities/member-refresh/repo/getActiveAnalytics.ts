import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { TimeSeriesData } from '../../member/Member.types';
import MemberRefresh from '../MemberRefresh';

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

const getActiveAnalytics = async ({
  communityId
}: GQLContext): Promise<GetActiveMemberAnalyticsResult> => {
  // Attempt to pull from the cache first.
  const cacheKey = `${QueryEvent.GET_ACTIVE_MEMBER_ANALYTICS}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const startOfToday = day.utc().startOf('d');
  const endOfToday = day.utc().endOf('d');

  const refreshes: MemberRefresh[] = await new BloomManager().find(
    MemberRefresh,
    {
      createdAt: { $gte: endOfToday.subtract(90, 'd').format() },
      member: { community: { id: communityId } }
    }
  );

  // Build an array of member count over the last 120 days.
  const timeSeriesData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(90).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(90 - i - 1, 'd').format();
      const startKey = startOfToday.subtract(90 - i - 1, 'd').format();

      const members: Set<string> = new Set<string>();

      const value = refreshes.filter(({ createdAt, member }) => {
        if (members.has(member.id)) return false;
        members.add(member.id);
        return createdAt >= startKey && createdAt <= dateKey;
      }).length;

      return { name: dateKey, value };
    })
  );

  // To calculate the totalGrowth, we do a simple subtraction of the count
  // over the last 30 days.
  const { length } = timeSeriesData;
  const lastTally = timeSeriesData[length - 1].value;
  const thirtyDaysAgoTally = timeSeriesData[length - 30 - 1].value;

  const activeGrowth = parseFloat(
    (((lastTally - thirtyDaysAgoTally) / (lastTally || 1)) * 100).toFixed(1)
  );

  const result: GetActiveMemberAnalyticsResult = {
    activeChartData: timeSeriesData,
    activeGrowth
  };

  cache.set(cacheKey, result);
  return result;
};

export default getActiveAnalytics;
