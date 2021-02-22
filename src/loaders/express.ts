import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { APP } from '@constants';
import refreshTokenFlow from '@entities/user/repo/refreshToken';
import googleRouter from '@integrations/google/Google.router';
import mailchimpRouter from '@integrations/mailchimp/Mailchimp.router';
import stripeRouter from '@integrations/stripe/Stripe.router';
import { verifyToken } from '@util/util';

/**
 * When a user is sending a request to the GraphQL resolvers, they pass along
 * an accessToken and refreshToken along in every request. If the access token
 * is expired, we need to update BOTH tokens and send them back.
 */
const refreshTokenIfExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken } = req.cookies;

  // If the accessToken has expired, but there is a valid refreshToken and
  // the request comes to the /graphql endpoint, we run the refresh flow.
  if (refreshToken && req.url === '/graphql' && !verifyToken(accessToken)) {
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

/**
 * Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 *
 * @see https://www.npmjs.com/package/helmet#how-it-works
 */
const loadExpress = () => {
  const app = express();

  // Limit urlencoded and json body sizes to 10 KB.
  app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

  // Stripe route needs to use the bodyParser's rawBody, not the JSON body,
  // so only enable if it isn't that.
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (req.originalUrl === '/stripe/webhook') next();
      else bodyParser.json({ limit: '10kb' })(req, res, next);
    }
  );

  app.use(cors({ credentials: true, origin: APP.CLIENT_URL }));
  app.use(cookieParser());
  app.use(helmet()); // Sets various HTTP response headers to prevent exploits.
  app.use(refreshTokenIfExpired);

  // ## EXPRESS ROUTERS

  app.use('/google', googleRouter);
  app.use('/mailchimp', mailchimpRouter);
  app.use('/stripe', stripeRouter);

  return app;
};

export default loadExpress;
