/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Query, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { Community, MembershipType } from '@entities';
import {
  CommunityPopulation,
  CreateCommunityArgs,
  GetCommunityArgs
} from './CommunityArgs';

@Resolver()
export default class CommunityResolver {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  @Mutation(() => Boolean, { nullable: true })
  async createCommunity(
    @Args()
    { autoAccept, name, membershipForm, membershipTypes }: CreateCommunityArgs
  ) {
    const bm = bloomManager.fork();
    const community = bm
      .communityRepo()
      .create({ autoAccept, membershipForm, name });

    membershipTypes.forEach((type: MembershipType) =>
      bm.membershipTypeRepo().create({ ...type, community })
    );

    await bm.persistAndFlush(
      community,
      `The ${name} community has been created!`,
      { community }
    );
  }

  /**
   * Fetches a community either by the ID or by the encodedURLName. The only
   * time the encodedURLName will be used is when the membershipForm is needed
   * in the GraphQL request.
   */
  @Query(() => Community)
  async getCommunity(
    @Args() { encodedURLName, id, population }: GetCommunityArgs
  ) {
    const bm = bloomManager.fork();

    const populate =
      population === CommunityPopulation.GET_MEMBERSHIPS
        ? ['memberships.type', 'memberships.user']
        : [];

    const queryBy = id ? { id } : { encodedURLName };
    return bm.communityRepo().findOne({ ...queryBy }, { populate });
  }
}
