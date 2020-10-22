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
import EventAttendeeResolver from '../entities/event-attendee/EventAttendeeResolver';
import EventResolver from '../entities/event/EventResolver';
import MembershipResolver from '../entities/membership/MembershipResolver';
import UserResolver from '../entities/user/UserResolver';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const authChecker: AuthChecker<GQLContext> = async (
  { args, context: { userId } },
  roles: string[]
) => {
  // If the userId or the communityId isn't present, then we can't even query
  // the DB to see if the member has admin priveleges, so return false.
  if (!userId) return false;
  if (!roles.length) return true;

  const role = await new BloomManager()
    .membershipRepo()
    .getMembershipRole(userId, args.communityId);

  return roles[0] === role;
};

/**
 * Builds the schema with the application's resolvers.
 */
export const createSchema = async (): Promise<GraphQLSchema> =>
  buildSchema({
    authChecker,
    resolvers: [
      CommunityResolver,
      EventResolver,
      EventAttendeeResolver,
      MembershipResolver,
      UserResolver
    ]
  });

export default async () => {
  // Set the playground to false so that's it's not accessible to the outside
  // world. Also handles the request context.
  const config: ApolloServerExpressConfig = {
    context: ({ req, res }) => ({
      communityId: req.cookies.communityId,
      res,
      userId: decodeToken(req.cookies.accessToken)?.userId
    }),
    playground: false,
    schema: await createSchema()
  };

  return new ApolloServer(config);
};
