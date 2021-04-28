import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import googleRouter from '@integrations/google/Google.router';
import hasuraRouter from '@integrations/hasura/Hasura.router';
import { APP } from '@util/constants';
import parseBody from './parseBody';
import refreshTokenIfExpired from './refreshTokenIfExpired';

/**
 * Returns the Express app after mounting all of the middleware on the
 * application, including body parsing to JSON, security headers (Helmet),
 * and requiring CORS credentials.
 */
const initExpress = (): express.Express => {
  const app = express();

  app.get('/test', (_, res) => res.json({ status: 'Up and running!' }));

  // ## MIDDLEWARE

  app.use(parseBody);
  app.use(cors({ credentials: true, origin: APP.CLIENT_URL }));
  app.use(cookieParser());
  app.use(helmet()); // Sets various HTTP response headers to prevent exploits.
  app.use(refreshTokenIfExpired);

  // ## 3RD PARTY ROUTERS

  app.use('/google', googleRouter);
  app.use('/hasura', hasuraRouter);

  return app;
};

export default initExpress;
