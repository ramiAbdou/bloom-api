/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return new BloomManager().userRepo().findAll();
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Ctx() { userId }: GQLContext) {
    return new BloomManager().userRepo().findOne({ id: userId });
  }

  @Authorized()
  @Query(() => Boolean)
  async isUserLoggedIn(@Ctx() { userId }: GQLContext) {
    return !!userId;
  }

  @Mutation(() => Boolean, { nullable: true })
  async sendVerificationEmail(@Arg('userId') userId: string) {
    await new BloomManager().userRepo().sendVerificationEmail(userId);
  }
}
