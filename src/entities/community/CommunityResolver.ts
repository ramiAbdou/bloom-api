/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Query, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { Community } from '@entities';
import GetCommunityArgs from './GetCommunityArgs';

@Resolver()
export default class CommunityResolver {
  /**
   * Creates a new community when Bloom has a new customer. Omits the addition
   * of a logo. For now, the community should send Bloom a square logo that
   * we will manually add to the Digital Ocean space.
   */
  @Mutation(() => Boolean)
  async createCommunity() {}

  @Query(() => Community)
  async getCommunity(@Args() { encodedURLName, id }: GetCommunityArgs) {
    const bm = bloomManager.fork();
    const queryBy = id ? { id } : { encodedURLName };
    return bm.communityRepo().findOne({ ...queryBy });
  }
}
