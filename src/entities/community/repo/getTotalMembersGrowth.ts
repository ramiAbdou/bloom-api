import day, { Dayjs } from 'dayjs';

import { GQLContext } from '@constants';
import { QueryEvent } from '@util/events';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { MemberStatus } from '@entities/member/Member.types';
import Member from '../../member/Member';

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @example getTotalGrowth() => [528, 173.1]
 * @example getTotalGrowth() => [1, 100]
 */
const getTotalGrowth = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<number[]> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_MEMBERS_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const endOf30DaysAgo: Dayjs = day.utc().subtract(30, 'day').endOf('day');
  const endOfToday: Dayjs = day.utc().endOf('day');

  const bm = new BloomManager();

  const numMembers30DaysAgo: number = await bm.em.count(Member, {
    community: { id: communityId },
    deletedAt: { $eq: null, $gt: endOf30DaysAgo.format() },
    joinedAt: { $lte: endOf30DaysAgo.format() },
    status: MemberStatus.ACCEPTED
  });

  const numMembersAddedSince: number = await bm.em.count(Member, {
    community: { id: communityId },
    deletedAt: { $eq: null, $gt: endOfToday.format() },
    joinedAt: { $gt: endOf30DaysAgo.format() },
    status: MemberStatus.ACCEPTED
  });

  const growthRatio: number =
    (numMembersAddedSince + numMembers30DaysAgo) / (numMembers30DaysAgo || 1);

  const growthPercentage = Number(((growthRatio - 1) * 100).toFixed(1));
  const result = [numMembersAddedSince + numMembers30DaysAgo, growthPercentage];
  cache.set(cacheKey, result);

  return result;
};

export default getTotalGrowth;
