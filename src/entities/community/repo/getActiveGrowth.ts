import day from 'dayjs';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';

const getActiveGrowth = async ({
  communityId
}: GQLContext): Promise<number[]> => {
  const cacheKey = `${QueryEvent.GET_ACTIVE_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();
  const startOf30DaysAgo = day.utc().subtract(30, 'day').startOf('d');
  const startOf60DaysAgo = day.utc().subtract(60, 'day').startOf('d');

  const refreshesLastMonth: number = await bm.em.count(Member, {
    community: { id: communityId },
    refreshes: {
      createdAt: {
        $gte: startOf60DaysAgo.format(),
        $lt: startOf30DaysAgo.format()
      }
    }
  });

  const refreshesThisMonth: number = await bm.em.count(Member, {
    community: { id: communityId },
    refreshes: { createdAt: { $gte: startOf30DaysAgo.format() } }
  });

  const growthRatio: number = refreshesThisMonth / (refreshesLastMonth || 1);
  const growthPercentage = Number(((growthRatio - 1) * 100).toFixed(1));
  const result = [refreshesThisMonth, growthPercentage];
  cache.set(cacheKey, result);

  return result;
};

export default getActiveGrowth;
