import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Member } from '@entities/entities';
import applyForMembership, {
  ApplyForMembershipArgs
} from './repo/applyForMembership';
import createMembers, { CreateMembersArgs } from './repo/createMembers';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import getActiveMemberAnalytics, {
  GetActiveMemberAnalyticsResult
} from './repo/getActiveAnalytics';
import getTotalMemberAnalytics, {
  GetTotalMemberAnalyticsResult
} from './repo/getTotalAnalytics';
import respondToApplicants, {
  RespondToApplicantsArgs
} from './repo/respondToApplicants';
import toggleAdmins, { ToggleAdminArgs } from './repo/toggleAdmins';

@Resolver()
export default class MemberResolver {
  /**
   * Creates a Member is for the given Community ID, and also creates a
   * User with the basic information from the member data.
   */
  @Mutation(() => Member, { nullable: true })
  async applyForMembership(
    @Args() args: ApplyForMembershipArgs
  ): Promise<Member> {
    return applyForMembership(args);
  }

  @Authorized('ADMIN')
  @Mutation(() => [Member], { nullable: true })
  async createMembers(@Args() args: CreateMembersArgs, @Ctx() ctx: GQLContext) {
    return createMembers(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async deleteMembers(@Args() args: DeleteMembersArgs, @Ctx() ctx: GQLContext) {
    return !!deleteMembers(args, ctx);
  }

  @Authorized('ADMIN')
  @Query(() => GetActiveMemberAnalyticsResult, { nullable: true })
  async getActiveMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getActiveMemberAnalytics(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => GetTotalMemberAnalyticsResult, { nullable: true })
  async getTotalMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getTotalMemberAnalytics(ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async respondToMembers(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return !!(await respondToApplicants(args, ctx));
  }

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async toggleAdmins(@Args() args: ToggleAdminArgs, @Ctx() ctx: GQLContext) {
    return toggleAdmins(args, ctx);
  }
}
