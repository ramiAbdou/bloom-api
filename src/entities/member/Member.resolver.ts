import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import Member, { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import applyToCommunity, {
  ApplyToCommunityArgs
} from './repo/applyToCommunity';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteMembers, { DemoteMembersArgs } from './repo/demoteMembers';
import getActiveMembersGrowth, {
  GetActiveMembersGrowthResult
} from './repo/getActiveMembersGrowth';
import getActiveMembersSeries from './repo/getActiveMembersSeries';
import getMembersGrowth, {
  GetMembersGrowthResult
} from './repo/getMembersGrowth';
import getMembersSeries from './repo/getMembersSeries';
import inviteMembers, { InviteMembersArgs } from './repo/inviteMembers';
import isEmailTaken, { IsEmailTakenArgs } from './repo/isEmailTaken';
import promoteMembers, { PromoteMembersArgs } from './repo/promoteMembers';
import respondToApplicants, {
  RespondToApplicantsArgs
} from './repo/respondToApplicants';
import restoreMembers, { RestoreMembersArgs } from './repo/restoreMembers';

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
  @Mutation(() => [Member])
  async deleteMembers(
    @Args() args: DeleteMembersArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return deleteMembers(args, ctx);
  }

  @Authorized(MemberRole.OWNER)
  @Mutation(() => [Member])
  async demoteMembers(
    @Args() args: DemoteMembersArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return demoteMembers(args, ctx);
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

  @Query(() => Boolean)
  async isEmailTaken(@Args() args: IsEmailTakenArgs): Promise<boolean> {
    return isEmailTaken(args);
  }

  @Authorized(MemberRole.OWNER)
  @Mutation(() => [Member])
  async promoteMembers(
    @Args() args: PromoteMembersArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return promoteMembers(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async respondToApplicants(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member[]> {
    return respondToApplicants(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async restoreMembers(@Args() args: RestoreMembersArgs): Promise<Member[]> {
    return restoreMembers(args);
  }
}
