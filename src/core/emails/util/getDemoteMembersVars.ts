import BloomManager from '@core/db/BloomManager';
import { Community, User } from '@entities/entities';
import { MemberRole } from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

export interface DemoteMembersPayload {
  communityId: string;
  memberIds: string[];
}

export interface DemoteMembersVars {
  community: Pick<Community, 'name'>;
  owner: Pick<User, 'email' | 'fullName'>;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns the variables for the DEMOTE_MEMBERS email.
 *
 * @param {DeleteMembersPayload} context
 * @param {string} context.communityId
 * @param {string[]} context.memberIds
 */
const getDemoteMembersVars = async (
  context: EmailPayload
): Promise<DemoteMembersVars[]> => {
  const { communityId, memberIds } = context as DemoteMembersPayload;

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

  const variables: DemoteMembersVars[] = users.map((user: User) => {
    return {
      community: { name: community.name },
      owner: { email: owner.email, fullName: owner.fullName },
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getDemoteMembersVars;
