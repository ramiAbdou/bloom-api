/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import {
  ApplyForMembershipArgs,
  DeleteMembershipsArgs,
  RespondToMembershipsArgs
} from './Membership.args';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  @Mutation(() => Membership, { nullable: true })
  async applyForMembership(
    @Args() { data, email, encodedUrlName }: ApplyForMembershipArgs
  ): Promise<Membership> {
    return new BloomManager()
      .membershipRepo()
      .applyForMembership(encodedUrlName, email, data);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async respondToMemberships(
    @Args() { membershipIds, response }: RespondToMembershipsArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return !!(await new BloomManager()
      .membershipRepo()
      .respondToMemberships(membershipIds, response, communityId));
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async deleteMemberships(
    @Args() { membershipIds }: DeleteMembershipsArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return !!(await new BloomManager()
      .membershipRepo()
      .deleteMemberships(membershipIds, communityId));
  }
}
