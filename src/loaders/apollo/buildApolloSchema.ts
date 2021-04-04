import { GraphQLSchema } from 'graphql';
import { buildSchema, ResolverData } from 'type-graphql';

import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations.resolver';
import EventAttendeeResolver from '@entities/event-attendee/EventAttendee.resolver';
import EventGuestResolver from '@entities/event-guest/EventGuest.resolver';
import EventResolver from '@entities/event/Event.resolver';
import MemberIntegrationsResolver from '@entities/member-integrations/MemberIntegrations.resolver';
import MemberValueResolver from '@entities/member-value/MemberValue.resolver';
import MemberResolver from '@entities/member/Member.resolver';
import PaymentResolver from '@entities/payment/Payment.resolver';
import UserResolver from '@entities/user/User.resolver';
import { GQLContext } from '@util/constants';
import isAuthenticated from './isAuthenticated';

const buildApolloSchema = async (): Promise<GraphQLSchema> => {
  const schema: GraphQLSchema = await buildSchema({
    authChecker: (args: ResolverData<GQLContext>, roles: string[]) => {
      return isAuthenticated({ context: args.context, roles });
    },
    resolvers: [
      CommunityIntegrations,
      EventResolver,
      EventAttendeeResolver,
      EventGuestResolver,
      MemberResolver,
      MemberIntegrationsResolver,
      MemberValueResolver,
      PaymentResolver,
      UserResolver
    ]
  });

  return schema;
};

export default buildApolloSchema;
