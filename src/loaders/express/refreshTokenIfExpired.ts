import express from 'express';

import refreshTokenFlow from '@entities/user/repo/refreshToken';
import { verifyToken } from '@util/util';

/**
 * Returns the next() function to pass onto the next Express middleware.
 *
 * When a user is sending a request to the GraphQL resolvers, they pass along
 * an accessToken and refreshToken along in every request. If the access token
 * is expired, we need to update BOTH tokens and send them back.
 *
 * @param req - Express Request object that stores the cookies.
 * @param res - Express Response object to store new tokens on.
 * @param next - Express Next function to pass onto the next middleware.
 */
const refreshTokenIfExpired = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { accessToken, refreshToken } = req.cookies;

  // If there is no accessToken, there is a valid refreshToken and
  // the request comes to the /graphql endpoint, we run the refresh flow.
  if (!accessToken && verifyToken(refreshToken) && req.url === '/graphql') {
    const tokens = await refreshTokenFlow({ rToken: refreshToken, res });

    // We have to update the tokens on the request as well in order to ensure
    // that GraphQL context can set the user ID properly.
    if (tokens) {
      req.cookies.accessToken = tokens.accessToken;
      req.cookies.refreshToken = tokens.refreshToken;
    }
  }

  return next();
};

export default refreshTokenIfExpired;
