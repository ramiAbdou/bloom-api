/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Arg, Query, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { Community } from '@entities';

@Resolver()
export default class CommunityResolver {
  @Query(() => Community)
  async community(@Arg('encodedName') encodedName: string) {
    const bm = bloomManager.fork();
    const populate = ['memberships.type', 'memberships.user'];
    return bm.communityRepo().findOne({ encodedName }, populate);
  }
}
