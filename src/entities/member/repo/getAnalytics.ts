import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field()
  value: number;
}

@ObjectType()
export class GetMemberAnalyticsResult {
  // Represents 120 data points representing the number of members in the
  // organization on any given day.
  @Field(() => [TimeSeriesData])
  activeChartData: TimeSeriesData[];

  // Percentage points of growth in the number of members over the last 30 days.
  @Field()
  activeGrowth: number;

  // Represents 120 data points representing the number of members in the
  // organization on any given day.
  @Field(() => [TimeSeriesData])
  totalChartData: TimeSeriesData[];

  // Percentage points of growth in the number of members over the last 30 days.
  @Field()
  totalGrowth: number;
}

const getTotalMembersAnalytics = async (
  communityId: string
): Promise<
  Pick<GetMemberAnalyticsResult, 'totalChartData' | 'totalGrowth'>
> => {
  const bm = new BloomManager();
  const endOfToday = day.utc().endOf('day');

  // Build an array of member count over the last 120 days.
  const totalChartData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(120).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(120 - i - 1, 'd').format();

      return {
        name: dateKey,
        value: await bm.em.count(Member, {
          community: { id: communityId },
          createdAt: { $lt: dateKey },
          deletedAt: { $or: [null, { $gt: dateKey }] },
          status: ['INVITED', 'ACCEPTED']
        })
      };
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

  return { totalChartData, totalGrowth };
};

const getActiveMembersAnalytics = async (
  communityId: string
): Promise<
  Pick<GetMemberAnalyticsResult, 'activeChartData' | 'activeGrowth'>
> => {
  const bm = new BloomManager();
  const startOfToday = day.utc().startOf('day');
  const endOfToday = day.utc().endOf('day');

  // Build an array of member count over the last 120 days.
  const activeChartData: TimeSeriesData[] = await Promise.all(
    Array.from(Array(120).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(120 - i - 1, 'd').format();
      const startKey = startOfToday.subtract(120 - i - 1, 'd').format();

      return {
        name: dateKey,
        value: await bm.em.count(Member, {
          community: { id: communityId },
          status: ['INVITED', 'ACCEPTED'],
          user: {
            refreshes: {
              $and: [
                { createdAt: { $gte: startKey } },
                { createdAt: { $lte: dateKey } }
              ]
            }
          }
        })
      };
    })
  );

  // To calculate the totalGrowth, we do a simple subtraction of the count
  // over the last 30 days.
  const { length } = activeChartData;
  const lastTally = activeChartData[length - 1].value;
  const thirtyDaysAgoTally = activeChartData[length - 30 - 1].value;

  const activeGrowth = parseFloat(
    (((lastTally - thirtyDaysAgoTally) / lastTally) * 100).toFixed(1)
  );

  return { activeChartData, activeGrowth };
};

export default async ({
  communityId
}: GQLContext): Promise<GetMemberAnalyticsResult> => {
  const cacheKey = `${Event.GET_MEMBER_ANALYTICS}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const [totalResult, activeResult] = await Promise.all([
    getTotalMembersAnalytics(communityId),
    getActiveMembersAnalytics(communityId)
  ]);

  console.log(activeResult);

  const result: GetMemberAnalyticsResult = { ...totalResult, ...activeResult };
  cache.set(cacheKey, result);

  return result;
};
