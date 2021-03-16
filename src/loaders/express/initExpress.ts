import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import googleRouter from '@integrations/google/Google.router';
import mailchimpRouter from '@integrations/mailchimp/Mailchimp.router';
import stripeRouter from '@integrations/stripe/Stripe.router';
import { APP } from '@util/constants';
import refreshTokenIfExpired from './refreshTokenIfExpired';

/**
 * Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 *
 * @see https://www.npmjs.com/package/helmet#how-it-works
 */
const initExpress = () => {
  const app = express();

  // Limit urlencoded and json body sizes to 10 KB.
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Stripe route needs to use the bodyParser's rawBody, not the JSON body,
  // so only enable if it isn't that.
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (req.originalUrl === '/stripe/webhook') next();
      else bodyParser.json({ limit: '10mb' })(req, res, next);
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

export default initExpress;
