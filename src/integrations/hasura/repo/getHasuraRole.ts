import { findOne } from '@core/db/db.util';
import Member, { MemberRole } from '@entities/member/Member';
import { HasuraRole } from '../Hasura.types';

interface GetHasuraRoleArgs {
  communityId: string;
  userId: string;
}

const getHasuraRole = async ({
  communityId,
  userId
}: GetHasuraRoleArgs): Promise<HasuraRole> => {
  if (!userId) return HasuraRole.GUEST;

  const member: Member = await findOne(Member, {
    community: communityId,
    user: userId
  });

  if (member?.role === MemberRole.ADMIN) return HasuraRole.ADMIN;
  if (member?.role === MemberRole.OWNER) return HasuraRole.OWNER;
  if (member) return HasuraRole.MEMBER;

  return HasuraRole.GUEST;
};

export default getHasuraRole;
