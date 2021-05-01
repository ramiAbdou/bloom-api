import { GraphQLSchema } from 'graphql';
import { buildSchema, ResolverData } from 'type-graphql';

import EventAttendeeResolver from '@entities/event-attendee/EventAttendee.resolver';
import MemberResolver from '@entities/member/Member.resolver';
import UserResolver from '@entities/user/User.resolver';
import { GQLContext } from '@util/constants';
import isAuthenticated from './isAuthenticated';

const buildApolloSchema = async (): Promise<GraphQLSchema> => {
  const schema: GraphQLSchema = await buildSchema({
    authChecker: (args: ResolverData<GQLContext>, roles: string[]) => {
      return isAuthenticated({ context: args.context, roles });
    },
    resolvers: [EventAttendeeResolver, MemberResolver, UserResolver]
  });

  return schema;
};

export default buildApolloSchema;
