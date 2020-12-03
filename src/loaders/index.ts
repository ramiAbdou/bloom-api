import 'reflect-metadata'; // Needed for type-graphql compilation.

import { APP } from '@constants';
import db from '@core/db/db';
import logger from '@core/logger';
import apollo from './apollo';
import express from './express';

/**
 * The entry point of the application. Runs all of the loaders functions
 * including starting the Express and Apollo (GraphQL) servers and making the
 * PostgreSQL database connections via MikroORM. Also loads files that otherwise
 * wouldn't be loaded so events can be triggered and fired correctly.
 */
const startServer = async () => {
  const app = express();
  const [apolloServer] = await Promise.all([apollo(), db.createConnection()]);
  apolloServer.applyMiddleware({ app, cors: false, path: '/graphql' });
  app.listen(APP.PORT, () => logger.info('SERVER_STARTED'));
};

startServer();
