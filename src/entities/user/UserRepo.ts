/**
 * @fileoverview Repository: User
 * @author Rami Abdou
 */

import { AuthTokens } from '@constants';
import { getEmailFromCode } from '@integrations/google/GoogleUtil';
import BaseRepo from '@util/db/BaseRepo';
import { generateTokens, verifyToken } from '@util/util';
import User from './User';

export default class UserRepo extends BaseRepo<User> {
  /**
   * Attempts to update the user's tokens for the current session. The following
   * cases are possible:
   *  1) If the refresh token is not present, that means they weren't logged in,
   *  and thus we do nothing.
   *  2) If the refresh token is present, we find the user in the DB that has
   *  that refresh token stored. If they don't exist or the access token is
   *  verified, then we don't do anything.
   *  3) If the access token isn't verified, we generate new tokens and store
   *  the new refreshToken in the DB.
   */
  async updateTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<AuthTokens> {
    if (!refreshToken) return null;

    const user: User = await this.findOne({ refreshToken });
    if (!user || verifyToken(accessToken)) return null;

    const {
      accessToken: updatedToken,
      refreshToken: updatedRefreshToken
    } = generateTokens({ userId: user.id });
    user.refreshToken = updatedRefreshToken;
    await this.flush('TOKENS_UPDATED', user);
    return { accessToken: updatedToken, refreshToken: updatedRefreshToken };
  }

  /**
   * Stores the Google refresh token in the database after executing the
   * OAuth token flow, and returns both the token and refreshToken.
   *
   * @param code Google's API produced authorization code that we exchange for
   * tokens.
   */
  async storeGoogleRefreshToken(code: string): Promise<AuthTokens> {
    const email = await getEmailFromCode(code);
    const user: User = await this.findOne({ email });

    if (!user) return null;

    const { accessToken, refreshToken } = generateTokens({ userId: user.id });
    user.refreshToken = refreshToken;
    await this.flush('GOOGLE_REFRESH_TOKEN_STORED', user);
    return { accessToken, refreshToken };
  }
}
