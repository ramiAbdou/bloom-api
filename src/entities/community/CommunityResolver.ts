/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Resolver } from 'type-graphql';

import { Community } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { CreateCommunityArgs } from './CommunityArgs';

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
    { autoAccept, name, membershipForm }: CreateCommunityArgs
  ): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .createCommunity({ autoAccept, membershipForm, name });
  }
}
