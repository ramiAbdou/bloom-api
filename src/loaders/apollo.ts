import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { AuthChecker, buildSchema } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberSocialsResolver from '@entities/member-socials/MemberSocials.resolver';
import { GQLContext } from '@util/constants';
import { decodeToken } from '@util/util';
import ApplicationQuestionResolver from '../entities/application-question/ApplicationQuestion.resolver';
import ApplicationResolver from '../entities/application/Application.resolver';
import CommunityIntegrationsResolver from '../entities/community-integrations/CommunityIntegrations.resolver';
import CommunityResolver from '../entities/community/Community.resolver';
import EventAttendeeResolver from '../entities/event-attendee/EventAttendee.resolver';
import EventGuestResolver from '../entities/event-guest/EventGuest.resolver';
import EventWatchResolver from '../entities/event-watch/EventWatch.resolver';
import EventResolver from '../entities/event/Event.resolver';
import MemberPlanResolver from '../entities/member-plan/MemberPlan.resolver';
import MemberValueResolver from '../entities/member-value/MemberValue.resolver';
import Member, { MemberRole } from '../entities/member/Member';
import MemberResolver from '../entities/member/Member.resolver';
import PaymentResolver from '../entities/payment/Payment.resolver';
import QuestionResolver from '../entities/question/Question.resolver';
import UserResolver from '../entities/user/User.resolver';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const authChecker: AuthChecker<GQLContext> = async (
  { context: { memberId } },
  roles: string[]
) => {
  if (!memberId) return false;
  const { role } = await new BloomManager().findOne(Member, { id: memberId });

  // If no roles are specified, we return true b/c only no roles would be
  // specified if we wanted ANY logged-in user to be authorized. And, we have
  // a userId (as seen from above).
  if (!roles.length) return true;

  return role === MemberRole.OWNER || roles[0] === role;
};

/**
 * Builds the schema with the application's resolvers.
 */
export const createSchema = async (): Promise<GraphQLSchema> =>
  buildSchema({
    authChecker,
    resolvers: [
      ApplicationQuestionResolver,
      ApplicationResolver,
      CommunityResolver,
      CommunityIntegrationsResolver,
      EventResolver,
      EventAttendeeResolver,
      EventGuestResolver,
      EventWatchResolver,
      MemberResolver,
      MemberSocialsResolver,
      MemberValueResolver,
      MemberPlanResolver,
      PaymentResolver,
      QuestionResolver,
      UserResolver
    ]
  });

/**
 * Initializes and export the Apollo server. Need to import all of the
 * GraphQL resolvers in order to build the schema. Also handles the Express
 * request sessions for users.
 */
const loadApollo = async () => {
  // Set the playground to false so that's it's not accessible to the outside
  // world. Also handles the request context.
  const config: ApolloServerExpressConfig = {
    context: ({ req, res }) => {
      const { communityId, memberId, userId } =
        decodeToken(req.cookies.accessToken) ?? {};

      return { communityId, memberId, res, userId };
    },
    playground: false,
    schema: await createSchema()
  };

  return new ApolloServer(config);
};

export default loadApollo;
