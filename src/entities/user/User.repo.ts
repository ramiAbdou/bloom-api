import { Response } from 'express';

import { APP, AuthTokens, LoginError } from '@constants';
import BaseRepo from '@core/db/BaseRepo';
import { sendEmail } from '@core/emails';
import URLBuilder from '@util/URLBuilder';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import Member from '../member/Member';
import User from './User';

type RefreshTokenFlowArgs = { res?: Response; user?: User; userId?: string };

export default class UserRepo extends BaseRepo<User> {
  /**
   * Refreshes the user's tokens and sets the HTTP only cookies if Express
   * res object is provided. If the refreshing succeeds, the tokenw il
   */
  refreshTokenFlow = async ({
    res,
    user,
    userId
  }: RefreshTokenFlowArgs): Promise<AuthTokens> => {
    user = user ?? (await this.findOne({ id: userId }));

    // If no user found with the given arguments or a user is found and
    // the access token is expired, then exit. Also, if there is a loginToken
    // present, then we verify that before proceeding.
    if (!user?.id) return null;

    const tokens = generateTokens({ userId: user.id });

    // If an Express Response object is passed in, set the HTTP only cookies.
    if (res) setHttpOnlyTokens(res, tokens);

    // Update the refreshToken in the DB.
    user.refreshToken = tokens.refreshToken;
    await this.flush('REFRESH_TOKEN_STORED', user);

    return tokens;
  };

  /**
   * Generates a temporary loginToken based on the user. Runs the refresh
   * flow with the user.
   */
  generateTemporaryLoginLink = async (user: User) => {
    const { accessToken: token } = await this.refreshTokenFlow({ user });
    return new URLBuilder(APP.CLIENT_URL).addParam('loginToken', token).url;
  };

  sendTemporaryLoginEmail = async (user: User) => {
    const { firstName, email } = user;

    await sendEmail('temp-login.mjml', 'Your Bloom Login Link', email, {
      firstName,
      loginUrl: await this.generateTemporaryLoginLink(user)
    });
  };

  /**
   * Returns the user's login status error based on their members and
   * whether or not they've been accepted into a community.
   *
   * Precondition: Members MUST already be populated.
   */
  getLoginStatusError = async (user: User): Promise<LoginError> =>
    !user
      ? 'USER_NOT_FOUND'
      : user.members
          .getItems()
          .reduce((acc: LoginError, { status }: Member) => {
            // SUCCESS CASE: If the user has been approved in some community,
            // update the refresh token in the DB.
            if (['ACCEPTED', 'INVITED'].includes(status)) return null;

            // If acc is null and application is PENDING, don't do anything, cause
            // the user is already approved. If acc isn't null, then set error to
            // APPLICATION_PENDING.
            if (acc && status === 'PENDING') return 'APPLICATION_PENDING';
            return acc;
          }, 'APPLICATION_REJECTED');
}
