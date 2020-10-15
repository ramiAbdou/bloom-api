/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';

@Resolver()
export default class MembershipResolver {
  /**
   * Creates a Membership is for the given Community ID, and also creates a
   * User with the basic information from the membership data.
   */
  // @Mutation(() => Membership, { nullable: true })
  // async createMembership(
  //   @Args() { data, userId }: CreateMembershipArgs,
  //   @Ctx() { communityId }: GQLContext
  // ) {
  //   return new BloomManager()
  //     .membershipRepo()
  //     .createMembership(communityId, data, userId);
  // }
}
