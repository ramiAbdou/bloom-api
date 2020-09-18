/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Query, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { Community } from '@entities';

@Resolver()
export default class CommunityResolver {
  @Query(() => [Community])
  async communities() {
    return bloomManager
      .fork()
      .communityRepo()
      .findAll({ populate: ['memberships.type', 'memberships.user'] });
  }
}
