/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { ApplyForMembershipArgs } from './MembershipArgs';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  @Mutation(() => Membership, { nullable: true })
  async applyForMembership(
    @Args() { data, email }: ApplyForMembershipArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<Membership> {
    return new BloomManager()
      .membershipRepo()
      .applyForMembership(communityId, email, data);
  }
}
