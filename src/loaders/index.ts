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
import lg from '@lg';
import { createConnection } from '@util/db/util';
import processMembershipCSV from '@util/processMembershipCSV';
import startApollo from './apollo';
import startExpress from './express';

const startServer = async () => {
  const app = startExpress();
  const [apolloServer] = await Promise.all([startApollo(), createConnection()]);
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  app.listen(APP.PORT, () =>
    lg.info(`Server up and running at: ${APP.SERVER_URL}.`)
  );

  await processMembershipCSV('ColorStack');
};

startServer();
