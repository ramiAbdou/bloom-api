/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Arg, Args, Authorized, Mutation, Resolver } from 'type-graphql';

import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import {
  AddNewAdminArgs,
  CreateMembershipArgs,
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
    @Args() { communityId, data, userId }: CreateMembershipArgs
  ) {
    return new BloomManager()
      .membershipRepo()
      .createMembership(communityId, data, userId);
  }

  @Mutation(() => Membership, { nullable: true })
  async deleteMemberships(@Arg('membershipIds') membershipIds: string[]) {
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
    { membershipId, communityId, firstName, lastName, email }: AddNewAdminArgs
  ) {
    return membershipId
      ? new BloomManager().membershipRepo().addAdminByMembershipId(membershipId)
      : new BloomManager()
          .membershipRepo()
          .addNewAdmin(communityId, firstName, lastName, email);
  }
}
