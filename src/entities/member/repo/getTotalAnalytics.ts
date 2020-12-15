import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';
import { TimeSeriesData } from '../Member.types';

@ObjectType()
export class GetTotalMemberAnalyticsResult {
  // Represents 90 data points representing the number of members in the
  // organization on any given day.
  @Field(() => [TimeSeriesData])
  totalChartData: TimeSeriesData[];

  // Percentage points of growth in the number of members over the last 30 days.
  @Field()
  totalGrowth: number;
}

export default async ({
  communityId
}: GQLContext): Promise<GetTotalMemberAnalyticsResult> => {
  const cacheKey = `${Event.GET_TOTAL_MEMBER_ANALYTICS}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const members = await bm.find(Member, {
    community: { id: communityId },
    status: ['ACCEPTED']
  });

  const endOfToday = day.utc().endOf('day');

  // Build an array of member count over the last 90 days.
  const totalChartData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(90).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(90 - i - 1, 'd').format();

      const value = members.filter(({ createdAt, deletedAt }) => {
        return createdAt < dateKey && (!deletedAt || deletedAt >= dateKey);
      }).length;

      return { name: dateKey, value };
    })
  );

  // To calculate the totalGrowth, we do a simple subtraction of the count
  // over the last 30 days.
  const { length } = totalChartData;
  const lastTally = totalChartData[length - 1].value;
  const thirtyDaysAgoTally = totalChartData[length - 30 - 1].value;

  const totalGrowth = parseFloat(
    (((lastTally - thirtyDaysAgoTally) / lastTally) * 100).toFixed(1)
  );

  const result: GetTotalMemberAnalyticsResult = { totalChartData, totalGrowth };
  cache.set(cacheKey, result);
  return result;
};
