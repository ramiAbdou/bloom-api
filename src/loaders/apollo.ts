/**
 * @fileoverview Loader: Apollo GraphQL Server
 * - Initializes and export the Apollo server. Need to import all of the
 * GraphQL resolvers in order to build the schema. Also handles the Express
 * request sessions for users.
 * @author Rami Abdou
 */

import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { AuthChecker, buildSchema } from 'type-graphql';

import CommunityResolver from '../entities/community/CommunityResolver';
import MembershipResolver from '../entities/membership/MembershipResolver';
import UserResolver from '../entities/user/UserResolver';
import { GQLContext } from '../util/constants';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const authChecker: AuthChecker<GQLContext> = ({
  context: { token, refreshToken }
}) => !!token && !!refreshToken;

/**
 * Builds the schema with the application's resolvers.
 */
export const createSchema = async (): Promise<GraphQLSchema> =>
  buildSchema({
    authChecker,
    resolvers: [CommunityResolver, MembershipResolver, UserResolver]
  });

export default async () => {
  // Set the playground to false so that's it's not accessible to the outside
  // world. Also handles the request context.
  const config: ApolloServerExpressConfig = {
    context: ({ req }) => ({
      refreshToken: req.cookies.refreshToken,
      token: req.cookies.token
    }),
    playground: false,
    schema: await createSchema()
  };

  return new ApolloServer(config);
};
