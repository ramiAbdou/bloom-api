import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import getTokens, { GetTokensArgs, GetTokensResult } from './repo/getTokens';
import getUser, { GetUserArgs } from './repo/getUser';
import sendLoginLink, { SendLoginLinkArgs } from './repo/sendLoginLink';
import updateUser, { UpdateUserArgs } from './repo/updateUser';
import verifyLoginToken, {
  VerifyLoginTokenArgs
} from './repo/verifyLoginToken';
import User from './User';

@Resolver()
export default class UserResolver {
  @Query(() => GetTokensResult, { nullable: true })
  async getTokens(
    @Args() args: GetTokensArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetTokensResult> {
    return getTokens(args, ctx);
  }

  @Query(() => User, { nullable: true })
  async getUser(@Args() args: GetUserArgs, @Ctx() ctx: GQLContext) {
    return getUser(args, ctx);
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
  async sendLoginLink(@Args() args: SendLoginLinkArgs) {
    return sendLoginLink(args);
  }

  @Authorized()
  @Mutation(() => User)
  async updateUser(
    @Args() args: UpdateUserArgs,
    @Ctx() ctx: GQLContext
  ): Promise<User> {
    return updateUser(args, ctx);
  }

  @Query(() => Boolean)
  async verifyLoginToken(
    @Args() args: VerifyLoginTokenArgs,
    @Ctx() ctx: GQLContext
  ) {
    return verifyLoginToken(args, ctx);
  }
}
