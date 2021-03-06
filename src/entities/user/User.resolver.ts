import { Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { TokenArgs } from '@util/gql';
import getTokens, { GetTokensArgs, GetTokensResult } from './repo/getTokens';
import getUser, { GetUserArgs } from './repo/getUser';
import sendLoginLink, { SendLoginLinkArgs } from './repo/sendLoginLink';
import verifyToken, { VerifiedToken } from './repo/verifyToken';
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

  @Query(() => User)
  async getUser(
    @Args() args: GetUserArgs,
    @Ctx() ctx: GQLContext
  ): Promise<User> {
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

  @Mutation(() => VerifiedToken)
  async verifyToken(@Args() args: TokenArgs, @Ctx() ctx: GQLContext) {
    return verifyToken(args, ctx);
  }
}
