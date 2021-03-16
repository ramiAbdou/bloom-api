import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import googleRouter from '@integrations/google/Google.router';
import mailchimpRouter from '@integrations/mailchimp/Mailchimp.router';
import stripeRouter from '@integrations/stripe/Stripe.router';
import { APP } from '@util/constants';
import parseBody from './parseBody';
import refreshTokenIfExpired from './refreshTokenIfExpired';

/**
 * Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 *
 * @see https://www.npmjs.com/package/helmet#how-it-works
 */
const initExpress = (): express.Express => {
  const app = express();

  // ## MIDDLEWARE

  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.use(parseBody);
  app.use(cors({ credentials: true, origin: APP.CLIENT_URL }));
  app.use(cookieParser());
  app.use(helmet()); // Sets various HTTP response headers to prevent exploits.
  app.use(refreshTokenIfExpired);

  // ## 3RD PARTY ROUTERS

  app.use('/google', googleRouter);
  app.use('/mailchimp', mailchimpRouter);
  app.use('/stripe', stripeRouter);

  return app;
};

export default initExpress;
