/**
 * @fileoverview Loader: Express
 * - Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 * @see https://www.npmjs.com/package/helmet#how-it-works
 * @author Rami Abdou
 */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { APP } from '@constants';
import { User } from '@entities/entities';
import UserRouter from '@entities/user/UserRouter';
import GoogleRouter from '@integrations/google/GoogleRouter';
import Auth from '@util/auth/Auth';
import BloomManager from '@util/db/BloomManager';

/**
 * Authentication middleware that tries to update the idToken if the idToken
 * is expired.
 */
const updateToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token, refreshToken } = req.cookies;
  if (!refreshToken) return next();

  const bm = new BloomManager();
  const user: User = await bm.userRepo().findOne({ refreshToken });
  if (!user) return next();

  const auth = new Auth();

  if (!auth.verifyToken(token)) {
    const {
      token: updatedToken,
      refreshToken: updatedRefreshToken
    } = auth.generateTokens({ userId: user.id });
    req.cookies.token = updatedToken;
    res.cookie('token', updatedToken);
    user.refreshToken = updatedRefreshToken;
    await bm.flush(`Refresh token updated for ${user.fullName}.`);
  }

  return next();
};

export default () => {
  const app = express();

  // Limit urlencoded and json body sizes to 10 KB.
  app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
  app.use(bodyParser.json({ limit: '10kb' }));
  app.use(cors({ credentials: true, origin: APP.CLIENT_URL }));
  app.use(cookieParser());
  app.use(helmet()); // Sets various HTTP response headers to prevent exploits.

  // Third-party routers (mostly for webhooks and catching routes).
  app.use('/google', new GoogleRouter().router);

  app.use(updateToken);
  app.use('/users', new UserRouter().router);

  return app;
};
