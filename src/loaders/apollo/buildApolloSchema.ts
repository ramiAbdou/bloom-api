import { GraphQLSchema } from 'graphql';
import { buildSchema, ResolverData } from 'type-graphql';

import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations.resolver';
import CommunityResolver from '@entities/community/Community.resolver';
import EventAttendeeResolver from '@entities/event-attendee/EventAttendee.resolver';
import EventGuestResolver from '@entities/event-guest/EventGuest.resolver';
import EventWatchResolver from '@entities/event-watch/EventWatch.resolver';
import EventResolver from '@entities/event/Event.resolver';
import MemberIntegrationsResolver from '@entities/member-integrations/MemberIntegrations.resolver';
import MemberSocialsResolver from '@entities/member-socials/MemberSocials.resolver';
import MemberTypeResolver from '@entities/member-type/MemberType.resolver';
import MemberValueResolver from '@entities/member-value/MemberValue.resolver';
import MemberResolver from '@entities/member/Member.resolver';
import PaymentResolver from '@entities/payment/Payment.resolver';
import QuestionResolver from '@entities/question/Question.resolver';
import RankedQuestionResolver from '@entities/ranked-question/RankedQuestion.resolver';
import UserResolver from '@entities/user/User.resolver';
import { GQLContext } from '@util/constants';
import isAuthenticated from './isAuthenticated';

const buildApolloSchema = async (): Promise<GraphQLSchema> => {
  const schema: GraphQLSchema = await buildSchema({
    authChecker: (args: ResolverData<GQLContext>, roles: string[]) => {
      return isAuthenticated({ context: args.context, roles });
    },
    resolvers: [
      CommunityResolver,
      CommunityIntegrations,
      EventResolver,
      EventAttendeeResolver,
      EventGuestResolver,
      EventWatchResolver,
      MemberResolver,
      MemberIntegrationsResolver,
      MemberSocialsResolver,
      MemberTypeResolver,
      MemberValueResolver,
      PaymentResolver,
      QuestionResolver,
      RankedQuestionResolver,
      UserResolver
    ]
  });

  return schema;
};

export default buildApolloSchema;
