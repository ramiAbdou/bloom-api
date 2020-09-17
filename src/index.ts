/**
 * @fileoverview Entry Point
 * - Starts the application server.
 * @author Rami Abdou, Enoch Chen
 */

import express from 'express';

import { APP } from '@constants';
import loaders from './loaders';

/**
 * The entry point of the application. Runs all of the loaders functions
 * including starting the Express and Apollo (GraphQL) servers and making the
 * PostgreSQL database connections via MikroORM.
 */
const startServer = async () => {
  const app = express();
  await loaders(app); // Call the loader functions.
  app.listen(APP.PORT); // Listen to incoming requests.
};

startServer();
