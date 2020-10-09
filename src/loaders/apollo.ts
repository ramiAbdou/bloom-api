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
import BloomManager from '@util/db/BloomManager';
import { decodeToken } from '@util/util';
import CommunityResolver from '../entities/community/CommunityResolver';
import MembershipResolver from '../entities/membership/MembershipResolver';
import UserResolver from '../entities/user/UserResolver';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const authChecker: AuthChecker<GQLContext> = async (
  { args, context: { userId } },
  roles
) => {
  // If the userId or the communityId isn't present, then we can't query the
  // DB to see if the member has admin priveleges, so return false.
  const { communityId } = args;
  if (!userId || !communityId) return false;

  const role = await new BloomManager()
    .membershipRepo()
    .getMembershipRole(userId, communityId);

  // If no roles are specified, then we should check if the role is at the
  // minimum ADMIN. If the role is populated, it will either be ADMIN or
  // OWNER, so return true if it is populated at all.
  if (!roles.length) return !!role;

  // The only role that would be provided in the roles array is OWNER, so now
  // we just check that that is the member's privelege.
  return role === 'OWNER';
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
      req,
      res,
      userId: decodeToken(req.cookies.token)?.userId
    }),
    playground: false,
    schema: await createSchema()
  };

  return new ApolloServer(config);
};
