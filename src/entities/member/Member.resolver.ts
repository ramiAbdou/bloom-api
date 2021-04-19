import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import Member, { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import applyToCommunity, {
  ApplyToCommunityArgs
} from './repo/applyToCommunity';
import getActiveMembersGrowth, {
  GetActiveMembersGrowthResult
} from './repo/getActiveMembersGrowth';
import getActiveMembersSeries from './repo/getActiveMembersSeries';
import getMembersGrowth, {
  GetMembersGrowthResult
} from './repo/getMembersGrowth';
import getMembersSeries from './repo/getMembersSeries';
import inviteMembers, { InviteMembersArgs } from './repo/inviteMembers';
import respondToApplicants, {
  RespondToApplicantsArgs
} from './repo/respondToApplicants';

@Resolver()
export default class MemberResolver {
  /**
   * Creates a Member is for the given Community ID, and also creates a
   * User with the basic information from the member data.
   */
  @Mutation(() => Member, { nullable: true })
  async applyToCommunity(
    @Args() args: ApplyToCommunityArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member> {
    return applyToCommunity(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => GetActiveMembersGrowthResult)
  async getActiveMembersGrowth(
    @Ctx() ctx: GQLContext
  ): Promise<GetActiveMembersGrowthResult> {
    return getActiveMembersGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getActiveMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getActiveMembersSeries(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => GetMembersGrowthResult)
  async getMembersGrowth(
    @Ctx() ctx: GQLContext
  ): Promise<GetMembersGrowthResult> {
    return getMembersGrowth(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getMembersSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getMembersSeries(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async inviteMembers(
    @Args() args: InviteMembersArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return inviteMembers(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async respondToApplicants(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return respondToApplicants(args, ctx);
  }
}
