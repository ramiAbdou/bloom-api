import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Member } from '@entities/entities';
import { AdminArgs } from './Member.types';
import applyForMembership, {
  ApplyForMembershipArgs
} from './repo/applyForMembership';
import createMembers, { CreateMembersArgs } from './repo/createMembers';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteToMember from './repo/demoteToMember';
import getActiveMemberAnalytics, {
  GetActiveMemberAnalyticsResult
} from './repo/getActiveAnalytics';
import getPaymentMethod, {
  GetPaymentMethodResult
} from './repo/getPaymentMethod';
import getTotalMemberAnalytics, {
  GetTotalMemberAnalyticsResult
} from './repo/getTotalAnalytics';
import promoteToAdmin from './repo/promoteToAdmin';
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

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async demoteToMember(@Args() args: AdminArgs, @Ctx() ctx: GQLContext) {
    return demoteToMember(args, ctx);
  }

  @Authorized('ADMIN')
  @Query(() => GetActiveMemberAnalyticsResult, { nullable: true })
  async getActiveMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getActiveMemberAnalytics(ctx);
  }

  @Authorized()
  @Query(() => GetPaymentMethodResult, { nullable: true })
  async getPaymentMethod(@Ctx() ctx: GQLContext) {
    return getPaymentMethod(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => GetTotalMemberAnalyticsResult, { nullable: true })
  async getTotalMemberAnalytics(@Ctx() ctx: GQLContext) {
    return getTotalMemberAnalytics(ctx);
  }

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async promoteToAdmin(@Args() args: AdminArgs, @Ctx() ctx: GQLContext) {
    return promoteToAdmin(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async respondToMembers(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return !!(await respondToApplicants(args, ctx));
  }
}
