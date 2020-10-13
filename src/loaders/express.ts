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
import GoogleRouter from '@integrations/google/GoogleRouter';
import MailchimpRouter from '@integrations/mailchimp/MailchimpRouter';
import ZoomRouter from '@integrations/zoom/ZoomRouter';
import BloomManager from '@util/db/BloomManager';
import UserRouter from '../entities/user/UserRouter';

/**
 * Authentication middleware that tries to update the token if the token
 * is expired.
 */
const updateToken = async (req: Request, res: Response, next: NextFunction) => {
  const tokens = await new BloomManager()
    .userRepo()
    .updateTokens(req.cookies.accessToken, req.cookies.refreshToken);

  if (!tokens) return next();

  const { accessToken, refreshToken } = tokens;
  req.cookies.accessToken = accessToken;
  req.cookies.refreshToken = refreshToken;
  res.cookie('accessToken', accessToken);
  res.cookie('refreshToken', refreshToken);

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

  // Third-party routers (mostly for webhooks and catching routes).
  app.use('/google', new GoogleRouter().router);
  app.use('/mailchimp', new MailchimpRouter().router);
  app.use('/zoom', new ZoomRouter().router);

  app.use('/users', new UserRouter().router);

  return app;
};
