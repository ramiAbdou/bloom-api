import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import MemberPlan from '../MemberPlan';

@ArgsType()
export class ListMemberPlansArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the MemberPlan(s) in a Community.
 *
 * @param args.communityId - ID of the Community.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listMemberPlans = async (
  args: ListMemberPlansArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberPlan[]> => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const plans: MemberPlan[] = await new BloomManager().find(
    MemberPlan,
    { community: communityId },
    {
      cacheKey: `${QueryEvent.LIST_MEMBER_PLANS}-${communityId}`,
      orderBy: { amount: QueryOrder.ASC }
    }
  );

  return plans;
};

export default listMemberPlans;
