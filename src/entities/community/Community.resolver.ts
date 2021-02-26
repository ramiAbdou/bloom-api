import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { MemberRole } from '@entities/member/Member';
import { TimeSeriesData } from '@util/gql';
import Community from './Community';
import getActiveDuesGrowth from './repo/getActiveDuesGrowth';
import getActiveMembersGrowth from './repo/getActiveMembersGrowth';
import getActiveMembersSeries from './repo/getActiveMembersSeries';
import getCommunity, { GetCommunityArgs } from './repo/getCommunity';
import getCommunityOwner, {
  GetCommunityOwnerArgs
} from './repo/getCommunityOwner';
import getEventAttendeesSeries from './repo/getEventAttendeesSeries';
import getTotalDuesGrowth from './repo/getTotalDuesGrowth';
import getTotalDuesSeries from './repo/getTotalDuesSeries';
import getTotalMembersGrowth from './repo/getTotalMembersGrowth';
import getTotalMembersSeries from './repo/getTotalMembersSeries';

@Resolver()
export default class CommunityResolver {
  @Authorized(MemberRole.ADMIN)
  @Query(() => Number)
  async getActiveDuesGrowth(@Ctx() ctx: GQLContext): Promise<number> {
    return getActiveDuesGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Number, Number])
  async getActiveMembersGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getActiveMembersGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getActiveMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getActiveMembersSeries(ctx);
  }

  @Query(() => Community)
  async getCommunity(
    @Args() args: GetCommunityArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Community> {
    return getCommunity(args, ctx);
  }

  @Query(() => Community)
  async getCommunityOwner(
    @Args() args: GetCommunityOwnerArgs
  ): Promise<Community> {
    return getCommunityOwner(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getEventAttendeesSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getEventAttendeesSeries(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => Number)
  async getTotalDuesGrowth(@Ctx() ctx: GQLContext): Promise<number> {
    return getTotalDuesGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getTotalDuesSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getTotalDuesSeries(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Number, Number])
  async getTotalMembersGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getTotalMembersGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getTotalMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getTotalMembersSeries(ctx);
  }
}
