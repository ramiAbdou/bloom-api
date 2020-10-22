/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { User } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { Populate } from '@util/gql';

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return new BloomManager().userRepo().findAll();
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Ctx() { userId }: GQLContext, @Populate() populate: string[]) {
    const bm = new BloomManager();
    return bm.userRepo().findOne({ id: userId }, populate);
  }

  @Query(() => Boolean)
  async isUserLoggedIn(@Ctx() { userId }: GQLContext) {
    return !!userId;
  }
}
