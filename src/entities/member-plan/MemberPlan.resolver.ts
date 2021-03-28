import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberPlan from './MemberPlan';
import listMemberPlans, { ListMemberPlansArgs } from './repo/listMemberPlans';

@Resolver()
export default class MemberPlanResolver {
  @Query(() => [MemberPlan])
  async listMemberPlans(
    @Args() args: ListMemberPlansArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberPlan[]> {
    return listMemberPlans(args, ctx);
  }
}
