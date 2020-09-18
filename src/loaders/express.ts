/**
 * @fileoverview Loader: Express
 * - Initializes and export the Express server. Middleware includes
 * body parsing to JSON, security measures (Helmet), sessions and more.
 * @see https://www.npmjs.com/package/helmet#how-it-works
 * @author Rami Abdou, Enoch Chen
 */

import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

export default () => {
  const app = express();

  // Limit urlencoded and json body sizes to 10 KB.
  app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
  app.use(bodyParser.json({ limit: '10kb' }));

  // Sets various HTTP response headers to prevent exploits like clickjacking.
  app.use(helmet());

  return app;
};
