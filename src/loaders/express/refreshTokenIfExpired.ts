import express from 'express';

import refreshToken from '@entities/user/repo/refreshToken';
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
): Promise<void> => {
  const { accessToken, refreshToken: rToken } = req.cookies;

  // If there is no accessToken, there is a valid refreshToken and
  // the request comes to the /graphql endpoint, we run the refresh flow.
  if (!accessToken && verifyToken(rToken) && req.url === '/graphql') {
    await refreshToken({ refreshToken: rToken }, { req, res });
  }

  return next();
};

export default refreshTokenIfExpired;
