/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Query, Resolver } from 'type-graphql';

import { Community } from '@entities';
import bm from '@util/db/bm';

@Resolver()
export default class CommunityResolver {
  @Query(() => [Community])
  async communities() {
    return bm
      .fork()
      .communityRepo()
      .findAll({ populate: ['memberships.type', 'memberships.user'] });
  }
}
