import { GraphQLSchema } from 'graphql';
import { AuthChecker, buildSchema, ResolverData } from 'type-graphql';

import EventAttendeeResolver from '@entities/event-attendee/EventAttendee.resolver';
import MemberResolver from '@entities/member/Member.resolver';
import UserResolver from '@entities/user/User.resolver';
import { GQLContext } from '@util/constants';
import { HasuraRole } from '../../integrations/hasura/Hasura.types';

/**
 * Returns true if the User is authenticated to make the request.
 */
const authChecker: AuthChecker = (
  { context }: ResolverData<GQLContext>,
  roles: string[]
): boolean => {
  if (!roles.length) return true;

  const { hasuraRole } = context;

  return roles.some((role: HasuraRole) => {
    switch (role) {
      case HasuraRole.ADMIN:
        return [HasuraRole.ADMIN, HasuraRole.OWNER].includes(hasuraRole);

      case HasuraRole.GUEST:
        return [
          HasuraRole.ADMIN,
          HasuraRole.GUEST,
          HasuraRole.MEMBER,
          HasuraRole.OWNER
        ].includes(hasuraRole);

      case HasuraRole.MEMBER:
        return [HasuraRole.ADMIN, HasuraRole.MEMBER, HasuraRole.OWNER].includes(
          hasuraRole
        );

      case HasuraRole.OWNER:
        return [HasuraRole.OWNER].includes(hasuraRole);

      default:
        return false;
    }
  });
};

const buildApolloSchema = async (): Promise<GraphQLSchema> => {
  const schema: GraphQLSchema = await buildSchema({
    authChecker,
    resolvers: [EventAttendeeResolver, MemberResolver, UserResolver]
  });

  return schema;
};

export default buildApolloSchema;
