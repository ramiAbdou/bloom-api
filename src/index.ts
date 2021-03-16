/* eslint-disable simple-import-sort/sort */

import 'reflect-metadata'; // Needed for type-graphql compilation.

import { ApolloServer } from 'apollo-server-express';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { MikroORM } from '@mikro-orm/core';

import { APP } from '@util/constants';
import { Express } from 'express';
import db from '@core/db/db';
import { LoggerEvent } from '@util/constants.events';
import logger from '@system/logger/logger';
import initApollo from './loaders/apollo/initApollo';
import initExpress from './loaders/express/initExpress';

import './loaders/misc';

day.extend(advancedFormat);
day.extend(utc);
day.extend(timezone);

/**
 * The entry point of the application. Runs all of the loaders functions
 * including starting the Express and Apollo (GraphQL) servers and making the
 * PostgreSQL database connections via MikroORM. Also loads files that otherwise
 * wouldn't be loaded so events can be triggered and fired correctly.
 */
const startServer = async () => {
  if (!process.env.APP_ENV) {
    throw new Error('APP_ENV must be supplied!');
  }

  const [app, apolloServer]: [
    Express,
    ApolloServer,
    MikroORM
  ] = await Promise.all([initExpress(), initApollo(), db.createConnection()]);

  apolloServer.applyMiddleware({
    app,
    cors: { origin: APP.CLIENT_URL },
    path: '/graphql'
  });

  app.listen(APP.PORT, () => {
    logger.log({ event: LoggerEvent.START_SERVER, level: 'INFO' });
  });
};

startServer();
