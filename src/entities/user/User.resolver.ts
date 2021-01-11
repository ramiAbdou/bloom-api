import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver
} from 'type-graphql';

import { GQLContext } from '@constants';
import { decodeToken } from '@util/util';
import changeCommunity, { ChangeCommunityArgs } from './repo/changeCommunity';
import getUser, { GetUserResult } from './repo/getUser';
import refreshToken from './repo/refreshToken';
import sendTemporaryLoginLink, {
  SendTemporaryLoginLinkArgs
} from './repo/sendTemporaryLoginLink';

@Resolver()
export default class UserResolver {
  /**
   * Logs a user out of the session by removing the HTTP only cookies.
   */
  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async changeCommunity(
    @Args() args: ChangeCommunityArgs,
    @Ctx() ctx: GQLContext
  ) {
    return changeCommunity(args, ctx);
  }

  @Authorized()
  @Query(() => GetUserResult, { nullable: true })
  async getUser(@Ctx() ctx: GQLContext) {
    return getUser(ctx);
  }

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

  @Mutation(() => Boolean, { nullable: true })
  async sendTemporaryLoginLink(@Args() args: SendTemporaryLoginLinkArgs) {
    return sendTemporaryLoginLink(args);
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
}
