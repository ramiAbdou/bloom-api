import { ArgsType, Field } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import MemberPlan from '../MemberPlan';

@ArgsType()
export class GetMemberPlansArgs {
  @Field({ nullable: true })
  urlName?: string;
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
  const { urlName } = args;
  const { communityId } = ctx;

  const queryArgs: FilterQuery<MemberPlan> = urlName
    ? { community: { urlName } }
    : { community: { id: communityId } };

  const key: string = urlName ?? communityId;

  const types: MemberPlan[] = await new BloomManager().find(
    MemberPlan,
    queryArgs,
    {
      cacheKey: `${QueryEvent.GET_TYPES}-${key}`,
      orderBy: { amount: QueryOrder.ASC }
    }
  );

  return types;
};

export default getMemberPlans;
