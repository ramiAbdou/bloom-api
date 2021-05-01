import { Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { TokenArgs } from '@util/constants.gql';
import getUserTokens, { GetUserTokensResult } from './repo/getUserTokens';
import logout from './repo/logout';
import sendLoginLink, {
  SendLoginLinkArgs,
  SendLoginLinkResult
} from './repo/sendLoginLink';
import verifyToken, { VerifiedToken } from './repo/verifyToken';

@Resolver()
export default class UserResolver {
  @Query(() => GetUserTokensResult, { nullable: true })
  async getUserTokens(@Ctx() ctx: GQLContext): Promise<GetUserTokensResult> {
    return getUserTokens(ctx);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: GQLContext): Promise<boolean> {
    return logout(ctx);
  }

  @Mutation(() => SendLoginLinkResult, { nullable: true })
  async sendLoginLink(
    @Args() args: SendLoginLinkArgs
  ): Promise<SendLoginLinkResult> {
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
