import BloomManager from '@core/db/BloomManager';
import Member, { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';

export interface IsAuthenticatedArgs {
  context: Pick<GQLContext, 'memberId'>;
  roles: string[];
}

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const isAuthenticated = async (args: IsAuthenticatedArgs): Promise<boolean> => {
  const { context, roles } = args;
  const { memberId } = context;

  // If the User isn't logged in, there won't be any memberId stored.
  if (!memberId) return false;

  const { role } = await new BloomManager().em.findOne(Member, memberId);

  // If no roles are specified, we return true b/c only no roles would be
  // specified if we wanted ANY logged-in user to be authorized. And, we have
  // a userId (as seen from above).
  if (!roles.length) return true;

  return role === MemberRole.OWNER || roles.includes(role);
};

export default isAuthenticated;
