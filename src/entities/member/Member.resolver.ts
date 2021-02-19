import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities/entities';
import { CreateSubsciptionArgs } from '../member-payment/repo/createSubscription';
import { AdminArgs, MemberStatus } from './Member.types';
import addMembers, { AddMembersArgs } from './repo/addMembers';
import applyForMembership, {
  ApplyForMembershipArgs
} from './repo/applyForMembership';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteMembers from './repo/demoteMembers';
import getChangePreview, {
  GetChangePreviewResult
} from './repo/getChangePreview';
import getMember, { GetMemberArgs } from './repo/getMember';
import getMembers from './repo/getMembers';
import getUpcomingPayment, {
  GetUpcomingPaymentResult
} from './repo/getUpcomingPayment';
import isEmailTaken, { IsEmailTakenArgs } from './repo/isEmailToken';
import promoteMembers from './repo/promoteMembers';
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
  @Authorized('ADMIN')
  @Mutation(() => [Member], { nullable: true })
  async addMembers(@Args() args: AddMembersArgs, @Ctx() ctx: GQLContext) {
    return addMembers(args, ctx);
  }

  /**
   * Creates a Member is for the given Community ID, and also creates a
   * User with the basic information from the member data.
   */
  @Mutation(() => Member, { nullable: true })
  async applyForMembership(
    @Args() args: ApplyForMembershipArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Member> {
    return applyForMembership(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => [Member])
  async deleteMembers(@Args() args: DeleteMembersArgs): Promise<Member[]> {
    return deleteMembers(args);
  }

  @Authorized('OWNER')
  @Mutation(() => [Member])
  async demoteMembers(@Args() args: AdminArgs): Promise<Member[]> {
    return demoteMembers(args);
  }

  @Query(() => Boolean)
  async isEmailTaken(@Args() args: IsEmailTakenArgs) {
    return isEmailTaken(args);
  }

  @Authorized('ADMIN')
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

  @Authorized('ADMIN')
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

  @Authorized('OWNER')
  @Mutation(() => [Member])
  async promoteMembers(@Args() args: AdminArgs) {
    return promoteMembers(args);
  }

  @Authorized('ADMIN')
  @Mutation(() => [Member])
  async respondToApplicants(@Args() args: RespondToApplicantsArgs) {
    return respondToApplicants(args);
  }

  @Authorized('ADMIN')
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
