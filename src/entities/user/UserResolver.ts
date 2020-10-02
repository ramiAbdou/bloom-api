/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import { Query, Resolver } from 'type-graphql';

import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return new BloomManager().userRepo().findAll();
  }
}
