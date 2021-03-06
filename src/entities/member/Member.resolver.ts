import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import Member, { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { CreateSubsciptionArgs } from '../payment/repo/createSubscription';
import applyToCommunity, {
  ApplyToCommunityArgs
} from './repo/applyToCommunity';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteMembers, { DemoteMembersArgs } from './repo/demoteMembers';
import getAllMembers from './repo/getAllMembers';
import getApplicants from './repo/getApplicants';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getDatabase from './repo/getDatabase';
import getDirectory from './repo/getDirectory';
import getMember, { GetMemberArgs } from './repo/getMember';
import getMembers from './repo/getMembers';
import getOwner, { GetOwnerArgs } from './repo/getOwner';
import getUpcomingPayment, {
  GetUpcomingPaymentResult
} from './repo/getUpcomingPayment';
import inviteMembers, { InviteMembersArgs } from './repo/inviteMembers';
import isEmailTaken, { IsEmailTakenArgs } from './repo/isEmailTaken';
import promoteMembers, { PromoteMembersArgs } from './repo/promoteMembers';
import respondToApplicants, {
  RespondToApplicantsArgs
} from './repo/respondToApplicants';
import restoreMembers, { RestoreMembersArgs } from './repo/restoreMembers';
import updateMember, { UpdateMemberArgs } from './repo/updateMember';
import updatePaymentMethod, {
  UpdatePaymentMethodArgs
} from './repo/updatePaymentMethod';

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
  @Query(() => [Member])
  async getApplicants(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getApplicants(ctx);
  }

  @Authorized()
  @Query(() => [Member])
  async getAllMembers(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getAllMembers(ctx);
  }

  @Authorized()
  @Query(() => GetChangePreviewResult, { nullable: true })
  async getChangePreview(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetChangePreviewResult> {
    return getChangePreview(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Member])
  async getDatabase(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getDatabase(ctx);
  }

  @Authorized()
  @Query(() => [Member])
  async getDirectory(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getDirectory(ctx);
  }

  @Authorized()
  @Query(() => Member, { nullable: true })
  async getMember(
    @Args() args: GetMemberArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member> {
    return getMember(args, ctx);
  }

  @Authorized()
  @Query(() => [Member])
  async getMembers(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getMembers(ctx);
  }

  @Query(() => Member)
  async getOwner(@Args() args: GetOwnerArgs): Promise<Member> {
    return getOwner(args);
  }

  @Authorized()
  @Query(() => GetUpcomingPaymentResult, { nullable: true })
  async getUpcomingPayment(
    @Ctx() ctx: GQLContext
  ): Promise<GetUpcomingPaymentResult> {
    return getUpcomingPayment(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async inviteMembers(@Args() args: InviteMembersArgs, @Ctx() ctx: GQLContext) {
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
  ) {
    return promoteMembers(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async respondToApplicants(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return respondToApplicants(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => [Member])
  async restoreMembers(@Args() args: RestoreMembersArgs): Promise<Member[]> {
    return restoreMembers(args);
  }

  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async updateMember(
    @Args() args: UpdateMemberArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member> {
    return updateMember(args, ctx);
  }

  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async updatePaymentMethod(
    @Args() args: UpdatePaymentMethodArgs,
    @Ctx() ctx: GQLContext
  ) {
    return updatePaymentMethod(args, ctx);
  }
}
