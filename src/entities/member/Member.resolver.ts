import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities/entities';
import { PopulateArgs } from '../../util/gql.types';
import { AdminArgs } from './Member.types';
import addMembers, { AddMembersArgs } from './repo/addMembers';
import applyForMembership, {
  ApplyForMembershipArgs
} from './repo/applyForMembership';
import deleteMembers, { DeleteMembersArgs } from './repo/deleteMembers';
import demoteToMember from './repo/demoteToMember';
import isEmailTaken, { IsEmailTakenArgs } from './repo/isEmailToken';
import promoteToAdmin from './repo/promoteToAdmin';
import respondToApplicants, {
  RespondToApplicantsArgs
} from './repo/respondToApplicants';
import updateAutoRenew, { UpdateAutoRenewArgs } from './repo/updateAutoRenew';
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
  @Mutation(() => Boolean, { nullable: true })
  async deleteMembers(@Args() args: DeleteMembersArgs, @Ctx() ctx: GQLContext) {
    return !!deleteMembers(args, ctx);
  }

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async demoteToMember(@Args() args: AdminArgs, @Ctx() ctx: GQLContext) {
    return demoteToMember(args, ctx);
  }

  @Query(() => Boolean)
  async isEmailTaken(@Args() args: IsEmailTakenArgs) {
    return isEmailTaken(args);
  }

  @Authorized()
  @Query(() => Member, { nullable: true })
  async getMember(
    @Args() { populate }: PopulateArgs,
    @Ctx() { memberId }: GQLContext
  ) {
    return new BloomManager().findOne(Member, { id: memberId }, { populate });
  }

  @Authorized('OWNER')
  @Mutation(() => [Member], { nullable: true })
  async promoteToAdmin(@Args() args: AdminArgs, @Ctx() ctx: GQLContext) {
    return promoteToAdmin(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => [Member], { nullable: true })
  async respondToApplicants(
    @Args() args: RespondToApplicantsArgs,
    @Ctx() ctx: GQLContext
  ) {
    return respondToApplicants(args, ctx);
  }

  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async updateAutoRenew(
    @Args() args: UpdateAutoRenewArgs,
    @Ctx() ctx: GQLContext
  ) {
    return updateAutoRenew(args, ctx);
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
