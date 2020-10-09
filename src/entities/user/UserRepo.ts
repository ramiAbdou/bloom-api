/**
 * @fileoverview Repository: User
 * @author Rami Abdou
 */

import { APP } from '@constants';
import GoogleAuth from '@integrations/google/GoogleAuth';
import { GoogleTokens } from '@integrations/google/GoogleTypes';
import BaseRepo from '@util/db/BaseRepo';
import { sendEmail, VERIFICATION_EMAIL_ARGS } from '@util/emails';
import { ValidateEmailData } from '@util/emails/types';
import { generateTokens, verifyToken } from '@util/util';
import User from './User';

export default class UserRepo extends BaseRepo<User> {
  /**
   * Sends the user a verification email to verify their email address. This
   * will only be triggered if a user manually requests the email to be sent
   * (again).
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    const { email, id }: User = await this.findOne({ id: userId });
    await sendEmail({
      ...VERIFICATION_EMAIL_ARGS,
      to: email,
      verificationUrl: `${APP.SERVER_URL}/users/${id}/verify`
    } as ValidateEmailData);
  }

  /**
   * Attemps to verify the user via the email verification that we send them.
   * If they are already verified, do nothing.
   */
  async verifyEmail(userId: string): Promise<void> {
    const user: User = await this.findOne({ id: userId });

    if (!user.verified) {
      user.verified = true;
      await this.flush('EMAIL_VERIFIED', user);
    }
  }

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
    token: string,
    refreshToken: string
  ): Promise<GoogleTokens> {
    if (!refreshToken) return null;

    const user: User = await this.findOne({ refreshToken });
    if (!user || verifyToken(token)) return null;

    const {
      token: updatedToken,
      refreshToken: updatedRefreshToken
    } = generateTokens({ userId: user.id });
    user.refreshToken = updatedRefreshToken;
    await this.flush('TOKENS_UPDATED', user);
    return { refreshToken: updatedRefreshToken, token: updatedToken };
  }

  /**
   * Stores the Google refresh token in the database after executing the
   * OAuth token flow, and returns both the token and refreshToken.
   *
   * @param code Google's API produced authorization code that we exchange for
   * tokens.
   */
  async storeGoogleRefreshToken(code: string): Promise<GoogleTokens> {
    const email = await new GoogleAuth().getEmailFromCode(code);
    const user: User = await this.findOne({ email });

    if (!user) return null;

    const { token, refreshToken } = generateTokens({ userId: user.id });
    user.refreshToken = refreshToken;
    await this.flush('GOOGLE_REFRESH_TOKEN_STORED', user);

    return { refreshToken, token };
  }
}
