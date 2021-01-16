import day, { Dayjs } from 'dayjs';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';

const getTotalGrowth = async ({
  communityId
}: GQLContext): Promise<number[]> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const endOf30DaysAgo: Dayjs = day.utc().subtract(30, 'day').endOf('day');
  const endOfToday: Dayjs = day.utc().endOf('day');

  const bm = new BloomManager();

  const numMembers30DaysAgo = await bm.em.count(Member, {
    community: { id: communityId },
    deletedAt: { $eq: null, $gt: endOf30DaysAgo.format() },
    joinedAt: { $lte: endOf30DaysAgo.format() },
    status: ['ACCEPTED']
  });

  const numMembersAddedSince = await bm.em.count(Member, {
    community: { id: communityId },
    deletedAt: { $eq: null, $gt: endOfToday.format() },
    joinedAt: { $gt: endOf30DaysAgo.format() },
    status: ['ACCEPTED']
  });

  const growthRatio: number =
    (numMembersAddedSince + numMembers30DaysAgo) / (numMembers30DaysAgo || 1);

  const growthPercentage = Number((growthRatio * 100).toFixed(1));
  const result = [numMembersAddedSince + numMembers30DaysAgo, growthPercentage];
  cache.set(cacheKey, result);

  return result;
};

export default getTotalGrowth;
