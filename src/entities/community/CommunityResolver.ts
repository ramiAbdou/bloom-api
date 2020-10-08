/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Query, Resolver } from 'type-graphql';

import { Community } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
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
  @Mutation(() => Community, { nullable: true })
  async createCommunity(
    @Args()
    { autoAccept, hasCSV, name, membershipForm }: CreateCommunityArgs
  ): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .createCommunity({ autoAccept, membershipForm, name }, hasCSV);
  }

  /**
   * Fetches a community either by the ID or by the encodedUrlName. The only
   * time the encodedUrlName will be used is when the membershipForm is needed
   * in the GraphQL request.
   */
  @Query(() => Community)
  async getCommunity(
    @Args() { encodedUrlName, id, population }: GetCommunityArgs
  ): Promise<Community> {
    const populate =
      population === CommunityPopulation.GET_MEMBERSHIPS
        ? ['memberships.type', 'memberships.user']
        : [];

    const queryBy = id ? { id } : { encodedUrlName };
    return new BloomManager()
      .communityRepo()
      .findOne({ ...queryBy }, { populate });
  }
}
