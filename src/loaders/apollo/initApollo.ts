import {
  ApolloServer,
  ApolloServerExpressConfig,
  ExpressContext
} from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';

import { GQLContext } from '@util/constants';
import { decodeToken } from '@util/util';
import buildApolloSchema from './buildApolloSchema';

/**
 * Initializes and export the Apollo server. Need to import all of the
 * GraphQL resolvers in order to build the schema. Also handles the Express
 * request sessions for users.
 */
const initApollo = async (): Promise<ApolloServer> => {
  const schema: GraphQLSchema = await buildApolloSchema();

  // Set the playground to false so that's it's not accessible to the outside
  // world. Also handles the request context.
  const config: ApolloServerExpressConfig = {
    context: (args: ExpressContext) => {
      const { req, res } = args;
      const decodedToken = decodeToken(req.cookies.accessToken);
      const { communityId, memberId, userId } = decodedToken ?? {};
      return { communityId, memberId, res, userId } as GQLContext;
    },
    playground: false,
    schema
  };

  return new ApolloServer(config);
};

export default initApollo;
