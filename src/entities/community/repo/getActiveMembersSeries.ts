import day from 'dayjs';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { TimeSeriesData } from '@util/gql.types';
import Member from '../../member/Member';

const getActiveGrowthSeries = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<TimeSeriesData[]> => {
  const cacheKey = `${QueryEvent.GET_ACTIVE_MEMBERS_SERIES}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const startOf30DaysAgo = day.utc().subtract(30, 'day').startOf('d');

  const activeMembersThisMonth: Member[] = await new BloomManager().find(
    Member,
    {
      community: { id: communityId },
      refreshes: { createdAt: { $gte: startOf30DaysAgo.format() } }
    },
    { orderBy: { createdAt: QueryOrder.DESC }, populate: ['refreshes'] }
  );

  const endOfToday = day.utc().endOf('d');

  // Build an array of member count over the last 90 days.
  const result: TimeSeriesData[] = await Promise.all(
    Array.from(Array(30).keys()).map(async (i: number) => {
      // The name key is the stringified datetime.
      const dateKey = endOfToday.subtract(30 - i - 1, 'd').format();

      const numActiveMembers = activeMembersThisMonth.filter(
        ({ refreshes }) => {
          return refreshes[0]?.createdAt < dateKey;
        }
      )?.length;

      return { name: dateKey, value: numActiveMembers };
    })
  );

  cache.set(cacheKey, result);

  return result;
};

export default getActiveGrowthSeries;
