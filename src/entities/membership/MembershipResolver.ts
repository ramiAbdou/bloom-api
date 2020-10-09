/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import {
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
  @Mutation(() => Membership)
  async respondToMembership(
    @Args() { membershipId, response }: MembershipResponseArgs,
    @Ctx() { userId: adminId }: GQLContext
  ) {
    return new BloomManager()
      .membershipRepo()
      .respondToMembership(membershipId, adminId, response);
  }
}
