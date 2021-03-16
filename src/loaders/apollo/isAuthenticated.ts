import { AuthChecker } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member, { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';

/**
 * The auth checker returns true (is authorized) if there is a refreshToken
 * present b/c we have an Express middleware that automatically updates the
 * idToken using the refreshToken if it is invalid.
 */
const isAuthenticated: AuthChecker<GQLContext> = async (
  { context: { memberId } },
  roles: string[]
): Promise<boolean> => {
  if (!memberId) return false;

  const { role } = await new BloomManager().findOne(Member, memberId);

  // If no roles are specified, we return true b/c only no roles would be
  // specified if we wanted ANY logged-in user to be authorized. And, we have
  // a userId (as seen from above).
  if (!roles.length) return true;

  return role === MemberRole.OWNER || roles[0] === role;
};

export default isAuthenticated;
