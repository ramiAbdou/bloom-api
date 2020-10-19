/**
 * @fileoverview Resolver: Membership
 * @author Rami Abdou
 */

import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { Membership } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { Populate } from '@util/gql';
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

  @Query(() => [Membership], { nullable: true })
  async getApplicants(
    @Arg('communityId') communityId: string,
    @Populate() populate: string[]
    // @Ctx() { communityId }: GQLContext
  ): Promise<Membership[]> {
    return new BloomManager()
      .membershipRepo()
      .getApplicants(communityId, populate);
  }
}
