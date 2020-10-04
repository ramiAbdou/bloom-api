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
import UserRouter from '@entities/user/UserRouter';
import GoogleAuth from '@integrations/google/GoogleAuth';
import GoogleRouter from '@integrations/google/GoogleRouter';

/**
 * Authentication middleware that tries to update the idToken if the idToken
 * is expired.
 */
const updateToken = async (req: Request, res: Response, next: NextFunction) => {
  const { idToken, refreshToken } = req.cookies;
  if (!refreshToken) return next();

  const auth = new GoogleAuth();
  const isValid = await auth.validateToken(idToken);
  if (!isValid) {
    const updatedToken = auth.getRefreshedToken(refreshToken);
    req.cookies.idToken = updatedToken;
    res.cookie('idToken', updatedToken);
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
  app.use(updateToken);

  // Register all of the Express routers.
  app.use('/google', new GoogleRouter().router);
  app.use('/users', new UserRouter().router);

  return app;
};
