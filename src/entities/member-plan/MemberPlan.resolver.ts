import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberPlan from './MemberPlan';
import getMemberPlans, { GetMemberPlansArgs } from './repo/getMemberPlans';

@Resolver()
export default class MemberPlanResolver {
  @Query(() => [MemberPlan])
  async getTypes(
    @Args() args: GetMemberPlansArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberPlan[]> {
    return getMemberPlans(args, ctx);
  }
}
