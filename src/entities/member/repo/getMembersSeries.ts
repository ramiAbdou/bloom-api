import day from 'dayjs';

import { find } from '@core/db/db.util';
import Member, { MemberStatus } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
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

  const members = await find(Member, {
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
