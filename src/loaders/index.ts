/**
 * @fileoverview Loader: Entry Point
 * - The entry point of the application. Runs all of the loaders functions
 * including starting the Express and Apollo (GraphQL) servers and making the
 * PostgreSQL database connections via MikroORM. Also loads files that otherwise
 * wouldn't be loaded so events can be triggered and fired correctly.
 * @author Rami Abdou
 */

import 'reflect-metadata'; // Needed for type-graphql compilation.

import { APP } from '@constants';
import logger from '@logger';
import db from '@util/db/db';
import apollo from './apollo';
import express from './express';

const startServer = async () => {
  const app = express();
  const [apolloServer] = await Promise.all([apollo(), db.createConnection()]);
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  app.listen(APP.PORT, () =>
    logger.info(`Server up and running at: ${APP.SERVER_URL}.`)
  );
};

startServer();
