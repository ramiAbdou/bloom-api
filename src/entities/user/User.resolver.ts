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
import getUser, { GetUserArgs } from './repo/getUser';
import refreshToken from './repo/refreshToken';
import sendLoginLink, { SendLoginLinkArgs } from './repo/sendLoginLink';
import updateUser, { UpdateUserArgs } from './repo/updateUser';
import verifyToken, { VerifyTokenArgs } from './repo/verifyToken';
import User from './User';

@Resolver()
export default class UserResolver {
  @Query(() => User, { nullable: true })
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
  async sendLoginLink(@Args() args: SendLoginLinkArgs) {
    return sendLoginLink(args);
  }

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async switchMember(
    @Arg('memberId') memberId: string,
    @Ctx() ctx: GQLContext
  ) {
    await refreshToken({ ...ctx, memberId });
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
  async verifyToken(@Args() args: VerifyTokenArgs, @Ctx() ctx: GQLContext) {
    return verifyToken(args, ctx);
  }
}
