import BloomManager from '@core/db/BloomManager';
import { Community, User } from '@entities/entities';
import { MemberRole } from '@entities/member/Member';
import { EmailContext } from '../emails.types';

export interface DeleteMembersContext {
  communityId: string;
  memberIds: string[];
}

export interface DeleteMembersVars {
  community: Pick<Community, 'name'>;
  owner: Pick<User, 'email' | 'fullName'>;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 *
 * @param {DeleteMembersContext} context
 * @param {string} context.communityId
 * @param {string[]} context.memberIds
 */
const getDeleteMembersVars = async (
  context: EmailContext
): Promise<DeleteMembersVars[]> => {
  const { communityId, memberIds } = context as DeleteMembersContext;

  const bm = new BloomManager();

  const [community, owner, users]: [
    Community,
    User,
    User[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(User, {
      members: { community: communityId, role: MemberRole.OWNER }
    }),
    bm.find(User, { members: { id: memberIds } })
  ]);

  const variables: DeleteMembersVars[] = users.map((user: User) => {
    return {
      community: { name: community.name },
      owner: { email: owner.email, fullName: owner.fullName },
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getDeleteMembersVars;
