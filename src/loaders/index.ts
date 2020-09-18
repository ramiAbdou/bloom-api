/**
 * @fileoverview - Calls all loader functions.
 * @author Rami Abdou
 */

import './misc';

import { Application } from 'express';

import { createConnection } from '@util/db/util';
import startApolloServer from './apollo';
import express from './express';

export default async (app: Application) => {
  const apolloServer = await startApolloServer();
  apolloServer.applyMiddleware({ app: express(app), path: '/graphql' });
  await createConnection();
};
