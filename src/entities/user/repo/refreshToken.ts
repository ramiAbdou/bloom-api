import express from 'express';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { JWT } from '@util/constants';
import { signToken } from '@util/util';
import User from '../User';

interface RefreshTokenOptions {
  /**
   * Express Request object to update the cookies on.
   */
  req?: express.Request;

  /**
   * Express Response object to update the cookies on.
   */
  res?: express.Response;

  /**
   * Additional token payload to store on the accessToken. By default, the
   * userId is already stored there.
   */
  tokenPayload?: Record<string, unknown>;
}

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided.
 *
 * @param {RefreshTokenOptions} options - Options for refreshing token.
 */
const refreshToken = async (
  where: FilterQuery<User>,
  options?: RefreshTokenOptions
): Promise<string> => {
  const { req, res, tokenPayload } = options ?? {};

  const bm: BloomManager = new BloomManager();
  const user: User = await bm.em.findOne(User, where);

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) {
    if (res) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    return null;
  }

  const payload: Record<string, unknown> = { ...tokenPayload, userId: user.id };

  // New accessToken to return
  const accessToken: string = signToken({ payload });
  if (req) req.cookies.accessToken = accessToken;

  // If it's the User's first time logging in, then we should create a refresh
  // token for them that does not expire and that we store on the User.
  if (!user.refreshToken) {
    const newRefreshToken: string = signToken({ expires: false, payload });
    user.refreshToken = newRefreshToken;
    await bm.em.flush();
    if (req) req.cookies.refreshToken = newRefreshToken;
  }

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) {
    const cookieOptions: express.CookieOptions = {
      // Can only access via server, not browser.
      httpOnly: true,
      // Can only access from an HTTPS endpoint, not HTTP.
      secure: process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'prod'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: JWT.EXPIRES_IN * 1000 // * 1000 b/c represented as milliseconds.
    });

    res.cookie('refreshToken', user.refreshToken, cookieOptions);
  }

  return accessToken;
};

export default refreshToken;
