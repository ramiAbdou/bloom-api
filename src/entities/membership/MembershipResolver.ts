/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import {
  AddNewAdminArgs,
  CreateMembershipArgs,
  DeleteMembershipArgs,
  MembershipResponseArgs,
  UpdateMembershipArgs
} from './MembershipArgs';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  @Mutation(() => Membership, { nullable: true })
  async createMembership(
    @Args() { data, userId }: CreateMembershipArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager()
      .membershipRepo()
      .createMembership(communityId, data, userId);
  }

  @Mutation(() => Membership, { nullable: true })
  async deleteMemberships(@Args() { membershipIds }: DeleteMembershipArgs) {
    return new BloomManager().membershipRepo().deleteMemberships(membershipIds);
  }

  /**
   * Updates the membership data that is specified, and leaves all other
   * membership data alone.
   */
  @Mutation(() => Membership)
  async updateMembershipData(
    @Args() { data, membershipId }: UpdateMembershipArgs
  ) {
    return new BloomManager()
      .membershipRepo()
      .updateMembershipData(membershipId, data);
  }

  /**
   * An admin has the option to either accept or reject a Membership when they
   * apply to the organization.
   */
  @Mutation(() => [Membership])
  async respondToMemberships(
    @Args() { membershipIds, response }: MembershipResponseArgs
  ) {
    return new BloomManager()
      .membershipRepo()
      .respondToMemberships(membershipIds, response);
  }

  @Authorized('OWNER')
  @Mutation(() => Membership)
  async addAdmin(
    @Args()
    { membershipId, firstName, lastName, email }: AddNewAdminArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return membershipId
      ? new BloomManager().membershipRepo().addAdminByMembershipId(membershipId)
      : new BloomManager()
          .membershipRepo()
          .addNewAdmin(communityId, firstName, lastName, email);
  }
}
