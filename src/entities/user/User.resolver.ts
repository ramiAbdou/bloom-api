/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext, LoginError } from '@constants';
import { User } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { decodeToken } from '@util/util';

@Resolver()
export default class UserResolver {
  /**
   * Called when a user hits the React /login route. We can't access HTTP only
   * cookies on the front-end b/c no JS access, so this GQL resolver exists.
   */
  @Query(() => Boolean)
  async isUserLoggedIn(@Ctx() { userId }: GQLContext) {
    return !!userId;
  }

  /**
   * Logs a user out of the session by removing the HTTP only cookies.
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: GQLContext) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return true;
  }

  @Query(() => Boolean)
  async verifyLoginToken(
    @Arg('loginToken') loginToken: string,
    @Ctx() { res }: GQLContext
  ) {
    const userId: string = decodeToken(loginToken)?.userId;

    if (
      !(await new BloomManager().userRepo().refreshTokenFlow({ res, userId }))
    ) {
      res.cookie('LOGIN_LINK_ERROR', 'TOKEN_EXPIRED');
      return false;
    }

    return true;
  }

  @Mutation(() => Boolean, { nullable: true })
  async sendTemporaryLoginLink(@Arg('email') email: string) {
    const userRepo = new BloomManager().userRepo();
    const user: User = await userRepo.findOne({ email }, ['memberships']);

    // If the user doesn't have a proper login status, we throw an error.
    const loginError: LoginError = await userRepo.getLoginStatusError(user);
    if (loginError) throw new Error(loginError);

    // Sends the email with the token-populated URL.
    await userRepo.sendTemporaryLoginEmail(user);

    return true;
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Ctx() { userId }: GQLContext) {
    return new BloomManager()
      .userRepo()
      .findOne({ id: userId }, ['memberships.community', 'memberships.type']);
  }
}
