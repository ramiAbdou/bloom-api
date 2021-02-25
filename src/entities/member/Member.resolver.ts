import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities/entities';
import { QueryEvent } from '@util/events';
import { CreateSubsciptionArgs } from '../member-payment/repo/createSubscription';
import { MemberRole, MemberStatus } from './Member';
import applyToCommunity, {
  ApplyToCommunityArgs
} from './repo/applyToCommunity';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteMembers, { DemoteMembersArgs } from './repo/demoteMembers';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getCommunityMembers from './repo/getCommunityMembers';
import getMember, { GetMemberArgs } from './repo/getMember';
import getMembers from './repo/getMembers';
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
  async deleteMembers(@Args() args: DeleteMembersArgs): Promise<Member[]> {
    return deleteMembers(args);
  }

  @Authorized(MemberRole.OWNER)
  @Mutation(() => [Member])
  async demoteMembers(@Args() args: DemoteMembersArgs): Promise<Member[]> {
    return demoteMembers(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Member])
  async getApplicants(@Ctx() { communityId }: GQLContext): Promise<Member[]> {
    return new BloomManager().find(
      Member,
      { community: { id: communityId }, status: MemberStatus.PENDING },
      {
        cacheKey: `${QueryEvent.GET_APPLICANTS}-${communityId}`,
        orderBy: { createdAt: QueryOrder.DESC },
        populate: ['data', 'user']
      }
    );
  }

  @Authorized()
  @Query(() => GetChangePreviewResult, { nullable: true })
  async getChangePreview(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetChangePreviewResult> {
    return getChangePreview(args, ctx);
  }

  @Authorized()
  @Query(() => [Member])
  async getCommunityMembers(@Ctx() ctx: GQLContext): Promise<Member[]> {
    return getCommunityMembers(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [Member])
  async getDatabase(@Ctx() { communityId }: GQLContext): Promise<Member[]> {
    return new BloomManager().find(
      Member,
      { community: { id: communityId }, status: MemberStatus.ACCEPTED },
      {
        cacheKey: `${QueryEvent.GET_DATABASE}-${communityId}`,
        orderBy: { createdAt: QueryOrder.DESC, updatedAt: QueryOrder.DESC },
        populate: ['data', 'user']
      }
    );
  }

  @Authorized()
  @Query(() => [Member])
  async getDirectory(@Ctx() { communityId }: GQLContext): Promise<Member[]> {
    return new BloomManager().find(
      Member,
      { community: { id: communityId }, status: MemberStatus.ACCEPTED },
      {
        cacheKey: `${QueryEvent.GET_DIRECTORY}-${communityId}`,
        orderBy: { createdAt: QueryOrder.DESC },
        populate: ['data', 'user']
      }
    );
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
  async promoteMembers(@Args() args: PromoteMembersArgs) {
    return promoteMembers(args);
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
