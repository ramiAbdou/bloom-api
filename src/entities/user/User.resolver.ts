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
import getUser, { GetUserArgs, GetUserResult } from './repo/getUser';
import refreshToken from './repo/refreshToken';
import sendTemporaryLoginLink, {
  SendTemporaryLoginLinkArgs
} from './repo/sendTemporaryLoginLink';
import updateUser, {
  UpdateUserArgs,
  UpdateUserResult
} from './repo/updateUser';

@Resolver()
export default class UserResolver {
  @Authorized()
  @Query(() => GetUserResult, { nullable: true })
  async getActiveCommunity(@Args() args: GetUserArgs, @Ctx() ctx: GQLContext) {
    return getUser(args, ctx);
  }

  @Query(() => GetUserResult, { nullable: true })
  async getUser(@Args() args: GetUserArgs, @Ctx() ctx: GQLContext) {
    return getUser(args, ctx);
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

  @Authorized()
  @Mutation(() => UpdateUserResult)
  async updateUser(@Args() args: UpdateUserArgs, @Ctx() ctx: GQLContext) {
    return updateUser(args, ctx);
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
