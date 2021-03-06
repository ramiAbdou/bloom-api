import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import MemberPlan from '../MemberPlan';

@ArgsType()
export class GetMemberPlansArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the MemberPlans for a community.
 *
 * @param {GetMemberPlansArgs} args
 * @param {string} [args.urlName]
 */
const getMemberPlans = async (
  args: GetMemberPlansArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberPlan[]> => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const types: MemberPlan[] = await new BloomManager().find(
    MemberPlan,
    { community: communityId },
    {
      cacheKey: `${QueryEvent.GET_TYPES}-${communityId}`,
      orderBy: { amount: QueryOrder.ASC }
    }
  );

  return types;
};

export default getMemberPlans;
