import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { HasuraRole } from '@integrations/hasura/Hasura.types';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import getActiveMembersGrowth, {
  GetActiveMembersGrowthResult
} from './repo/getActiveMembersGrowth';
import getActiveMembersSeries from './repo/getActiveMembersSeries';
import getMembersGrowth, {
  GetMembersGrowthResult
} from './repo/getMembersGrowth';
import getMembersSeries from './repo/getMembersSeries';

@Resolver()
export default class MemberResolver {
  @Authorized(HasuraRole.ADMIN)
  @Query(() => GetActiveMembersGrowthResult)
  async getActiveMembersGrowth(
    @Ctx() ctx: GQLContext
  ): Promise<GetActiveMembersGrowthResult> {
    return getActiveMembersGrowth(ctx);
  }

  @Authorized(HasuraRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getActiveMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getActiveMembersSeries(ctx);
  }

  @Authorized(HasuraRole.ADMIN)
  @Query(() => GetMembersGrowthResult)
  async getMembersGrowth(
    @Ctx() ctx: GQLContext
  ): Promise<GetMembersGrowthResult> {
    return getMembersGrowth(ctx);
  }

  @Authorized(HasuraRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getMembersSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getMembersSeries(ctx);
  }
}
