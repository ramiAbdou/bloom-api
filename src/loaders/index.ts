/**
 * @fileoverview Loader:  Calls all loader functions.
 * @author Rami Abdou
 */

import './misc';

import { APP } from '@constants';
import { createConnection } from '@util/db/util';
import startApollo from './apollo';
import startExpress from './express';

/**
 * The entry point of the application. Runs all of the loaders functions
 * including starting the Express and Apollo (GraphQL) servers and making the
 * PostgreSQL database connections via MikroORM.
 */

const startServer = async () => {
  const app = startExpress();
  const [apolloServer] = await Promise.all([startApollo(), createConnection()]);
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  app.listen(APP.PORT);
};

startServer();
