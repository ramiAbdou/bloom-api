/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import { Query, Resolver } from 'type-graphql';

import { User } from '@entities';
import bm from '@util/db/bm';

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return bm.fork().userRepo().findAll();
  }
}
