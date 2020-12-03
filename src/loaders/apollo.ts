import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { AuthChecker, buildSchema } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { decodeToken } from '@core/util';
import CommunityIntegrations from '../entities/community-integrations/CommunityIntegrations.resolver';
import CommunityResolver from '../entities/community/Community.resolver';
import MembershipQuestionResolver from '../entities/membership-question/MembershipQuestion.resolver';
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
  // If the userId isn't present or the userId doesn't exist in the DB, then
  // the user isn't authenticated.
  if (!userId || !(await new BloomManager().userRepo().findOne({ id: userId })))
    return false;

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
    resolvers: [
      CommunityResolver,
      CommunityIntegrations,
      MembershipQuestionResolver,
      MembershipResolver,
      UserResolver
    ]
  });

/**
 * Initializes and export the Apollo server. Need to import all of the
 * GraphQL resolvers in order to build the schema. Also handles the Express
 * request sessions for users.
 */
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
