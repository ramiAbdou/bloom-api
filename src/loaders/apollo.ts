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

import { GQLContext } from '@constants';
import { decodeToken } from '@util/util';
import CommunityResolver from '../entities/community/Community.resolver';
import MembershipResolver from '../entities/membership/Membership.resolver';
import UserResolver from '../entities/user/User.resolver';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const authChecker: AuthChecker<GQLContext> = async (
  { context: { role, userId } },
  roles: string[]
) => {
  // If the userId or the communityId isn't present, then we can't even query
  // the DB to see if the member has admin priveleges, so return false.
  if (!userId) return false;

  // If no roles are specified, we return true b/c only no roles would be
  // specified if we wanted ANY logged-in user to be authorized. And, we have
  // a userId (as seen from above).
  if (!roles.length) return true;

  return role === 'OWNER' || roles[0] === role;
};

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
    context: ({ req, res }) => ({
      communityId: req.cookies.communityId,
      res,
      role: req.cookies.role, // Saves DB call on every GraphQL query.
      userId: decodeToken(req.cookies.accessToken)?.userId
    }),
    playground: false,
    schema: await createSchema()
  };

  return new ApolloServer(config);
};
