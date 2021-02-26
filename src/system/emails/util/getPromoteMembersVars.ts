import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { MemberRole } from '@entities/member/Member';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface PromoteMembersPayload {
  communityId: string;
  memberIds: string[];
}

export interface PromoteMembersVars {
  community: Pick<Community, 'name'>;
  owner: Pick<User, 'email' | 'fullName'>;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns the variables for the PROMOTE_MEMBERS email.
 *
 * @param {DeleteMembersPayload} context
 * @param {string} context.communityId
 * @param {string[]} context.memberIds
 */
const getPromoteMembersVars = async (
  context: EmailPayload
): Promise<PromoteMembersVars[]> => {
  const { communityId, memberIds } = context as PromoteMembersPayload;

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

  const variables: PromoteMembersVars[] = users.map((user: User) => {
    return {
      community: { name: community.name },
      owner: { email: owner.email, fullName: owner.fullName },
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getPromoteMembersVars;
