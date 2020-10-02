/**
 * @fileoverview Loader: Express
 * - Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 * @see https://www.npmjs.com/package/helmet#how-it-works
 * @author Rami Abdou
 */

import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import UserRouter from '@entities/user/UserRouter';

export default () => {
  const app = express();

  // Limit urlencoded and json body sizes to 10 KB.
  app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
  app.use(bodyParser.json({ limit: '10kb' }));

  // Sets various HTTP response headers to prevent exploits like clickjacking.
  app.use(helmet());

  // Register all of the Express routers.
  app.use('/users', new UserRouter().router);

  return app;
};
