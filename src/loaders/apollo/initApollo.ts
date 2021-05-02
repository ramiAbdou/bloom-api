import {
  ApolloServer,
  ApolloServerExpressConfig,
  ExpressContext
} from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';

import { GQLContext, JWT } from '@util/constants';
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
    context: ({ req, res }: ExpressContext) => {
      const accessToken: string = req.headers['x-access-token'] as string;

      if (!req.cookies.accessToken && accessToken) {
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          // * 1000 b/c represented as milliseconds.
          maxAge: JWT.EXPIRES_IN * 1000,
          secure:
            process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'prod'
        });
      }

      const userId: string = decodeToken(accessToken)?.userId;

      return {
        hasuraRole: req.headers['x-hasura-role'],
        res,
        userId
      } as GQLContext;
    },
    playground: false,
    schema
  };

  return new ApolloServer(config);
};

export default initApollo;
