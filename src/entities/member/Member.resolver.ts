import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Member } from '@entities/entities';
import applyForMembership, {
  ApplyForMembershipArgs
} from './repo/applyForMembership';
import createMembers, { CreateMembersArgs } from './repo/createMembers';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import getMemberAnalytics, {
  GetMemberAnalyticsResult
} from './repo/getAnalytics';
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
  @Query(() => GetMemberAnalyticsResult, { nullable: true })
  async getMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getMemberAnalytics(ctx);
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
