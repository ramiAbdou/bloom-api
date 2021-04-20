import day, { Dayjs } from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member, { MemberStatus } from '@entities/member/Member';
import { GQLContext } from '@util/constants';

@ObjectType()
export class GetMembersGrowthResult {
  @Field()
  count: number;

  @Field()
  growth: number;
}

/**
 * Returns the total growth of the accepted members within the community,
 * including the current total number of members as well as the growth
 * percentage.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 * @example
 * // Returns [528, 173.1]
 * getTotalGrowth()
 */
const getMembersGrowth = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<GetMembersGrowthResult> => {
  const { communityId } = ctx;

  const endOf30DaysAgo: Dayjs = day.utc().subtract(30, 'day').endOf('day');
  const endOfToday: Dayjs = day.utc().endOf('day');

  const bm: BloomManager = new BloomManager();

  const numMembers30DaysAgo: number = await bm.em.count(Member, {
    community: communityId,
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

  const result = {
    count: numMembersAddedSince + numMembers30DaysAgo,
    growth: growthPercentage
  };

  return result;
};

export default getMembersGrowth;
