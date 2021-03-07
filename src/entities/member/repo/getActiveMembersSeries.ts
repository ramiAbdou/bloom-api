import day from 'dayjs';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { TimeSeriesData } from '@util/gql';

const getActiveMembersSeries = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<TimeSeriesData[]> => {
  const { communityId } = ctx;

  const cacheKey = `${QueryEvent.GET_ACTIVE_MEMBERS_SERIES}-${communityId}`;

  if (Member.cache.has(cacheKey)) {
    return Member.cache.get(cacheKey);
  }

  const startOf30DaysAgo = day.utc().subtract(30, 'day').startOf('d');

  const activeMembersThisMonth: Member[] = await new BloomManager().find(
    Member,
    {
      community: communityId,
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

export default getActiveMembersSeries;
