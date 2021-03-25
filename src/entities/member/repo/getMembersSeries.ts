import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import Member, { MemberStatus } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { TimeSeriesData } from '@util/constants.gql';

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @example
 * // Returns [
 * // { name: '2021-01-16T00:00:00Z', value: 100 },
 * // { name: '2021-01-17T00:00:00Z', value: 150 },
 * // { name: '2021-01-18T00:00:00Z', value: 200 },
 * // ]
 * getMembersSeries()
 */
const getMembersSeries = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<TimeSeriesData[]> => {
  const { communityId } = ctx;
  const cacheKey = `${QueryEvent.GET_MEMBERS_SERIES}-${communityId}`;

  if (Member.cache.has(cacheKey)) {
    return Member.cache.get(cacheKey);
  }

  const members = await new BloomManager().find(Member, {
    community: communityId,
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

export default getMembersSeries;
