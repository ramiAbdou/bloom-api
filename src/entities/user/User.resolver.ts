import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { User } from '@entities/entities';
import { decodeToken } from '@util/util';
import refreshToken from './repo/refreshToken';

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

    if (!(await refreshToken({ res, userId }))) {
      res.cookie('LOGIN_LINK_ERROR', 'TOKEN_EXPIRED');
      return false;
    }

    return true;
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Ctx() { userId }: GQLContext) {
    return new BloomManager().findOne(
      User,
      { id: userId },
      {
        populate: [
          'members.community.integrations',
          'members.community.types',
          'members.type'
        ]
      }
    );
  }
}
