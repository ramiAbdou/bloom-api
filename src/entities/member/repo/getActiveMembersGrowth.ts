import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';

@ObjectType()
export class GetActiveMembersGrowthResult {
  @Field()
  count: number;

  @Field()
  growth: number;
}

/**
 * Returns the [# of Active Members, % of Growth in last 30 days.]
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 *
 * @example
 * // Returns [528, 173.1]
 * getActiveMembersGrowth()
 */
const getActiveMembersGrowth = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<GetActiveMembersGrowthResult> => {
  const { communityId } = ctx;

  const startOf30DaysAgo = day.utc().subtract(30, 'day').startOf('d').format();
  const startOf60DaysAgo = day.utc().subtract(60, 'day').startOf('d').format();

  const bm: BloomManager = new BloomManager();

  const refreshesLastMonth: number = await bm.em.count(Member, {
    community: communityId,
    refreshes: { createdAt: { $gte: startOf60DaysAgo, $lt: startOf30DaysAgo } }
  });

  const refreshesThisMonth: number = await bm.em.count(Member, {
    community: communityId,
    refreshes: { createdAt: { $gte: startOf30DaysAgo } }
  });

  const growthRatio: number = refreshesThisMonth / (refreshesLastMonth || 1);
  const growthPercentage = Number(((growthRatio - 1) * 100).toFixed(1));
  const result = { count: refreshesThisMonth, growth: growthPercentage };

  return result;
};

export default getActiveMembersGrowth;
