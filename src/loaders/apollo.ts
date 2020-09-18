/**
 * @fileoverview Loader: Apollo GraphQL Server
 * - Initializes and export the Apollo server. Need to import all of the
 * GraphQL resolvers in order to build the schema. Also handles the Express
 * request sessions for users.
 * @author Rami Abdou
 */

import 'reflect-metadata'; // Needed for type-graphql compilation.

import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';

import UserResolver from '../entities/user/UserResolver';

export default async () => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers: [UserResolver],
    // Only set to false b/c we don't use the class-validator anywhere YET.
    validate: false
  });

  // Set the playground to false so that's it's not accessible to the outside
  // world. Also handles the request context.
  const config: ApolloServerExpressConfig = { playground: false, schema };
  return new ApolloServer(config);
};
