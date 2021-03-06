import { Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { TokenArgs } from '@util/constants.gql';
import getUser, { GetUserArgs } from './repo/getUser';
import getUserTokens, {
  GetUserTokensArgs,
  GetUserTokensResult
} from './repo/getUserTokens';
import logout from './repo/logout';
import sendLoginLink, { SendLoginLinkArgs } from './repo/sendLoginLink';
import verifyToken, { VerifiedToken } from './repo/verifyToken';
import User from './User';

@Resolver()
export default class UserResolver {
  @Query(() => User)
  async getUser(
    @Args() args: GetUserArgs,
    @Ctx() ctx: GQLContext
  ): Promise<User> {
    return getUser(args, ctx);
  }

  @Query(() => GetUserTokensResult, { nullable: true })
  async getUserTokens(
    @Args() args: GetUserTokensArgs,
    @Ctx() ctx: GQLContext
  ): Promise<GetUserTokensResult> {
    return getUserTokens(args, ctx);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: GQLContext): Promise<boolean> {
    return logout(ctx);
  }

  @Mutation(() => Boolean, { nullable: true })
  async sendLoginLink(@Args() args: SendLoginLinkArgs): Promise<void> {
    return sendLoginLink(args);
  }

  @Mutation(() => VerifiedToken)
  async verifyToken(
    @Args() args: TokenArgs,
    @Ctx() ctx: GQLContext
  ): Promise<VerifiedToken> {
    return verifyToken(args, ctx);
  }
}
