/**
 * @fileoverview Resolver: User
 * - Supports fetching and updating users.
 * @author Rami Abdou
 */

import decode from 'jwt-decode';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { APP, GQLContext } from '@constants';
import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import { sendVerificationEmail } from '@util/emails';

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return new BloomManager().userRepo().findAll();
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Ctx() { token }: GQLContext) {
    const { userId } = decode(token);
    return new BloomManager().userRepo().findOne({ id: userId });
  }

  @Authorized()
  @Query(() => Boolean)
  async isUserLoggedIn(@Ctx() { refreshToken }: GQLContext) {
    return !!refreshToken;
  }

  @Mutation(() => Boolean, { nullable: true })
  async sendVerificationEmail(@Arg('userId') userId: string) {
    const { email, id }: User = await new BloomManager()
      .userRepo()
      .findOne({ id: userId });

    await sendVerificationEmail({
      to: email,
      verificationUrl: `${APP.SERVER_URL}/users/${id}/verify`
    });
  }
}
