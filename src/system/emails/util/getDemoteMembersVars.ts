import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member, { MemberRole } from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

export interface DemoteMembersPayload {
  communityId: string;
  memberIds: string[];
}

export interface DemoteMembersVars {
  community: Pick<Community, 'name'>;
  owner: Pick<Member, 'email' | 'fullName'>;
  member: Pick<Member, 'email' | 'firstName'>;
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
    Member,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Member, { community: communityId, role: MemberRole.OWNER }),
    bm.find(Member, { id: memberIds })
  ]);

  const variables: DemoteMembersVars[] = users.map((member: Member) => {
    return {
      community: { name: community.name },
      member: { email: member.email, firstName: member.firstName },
      owner: { email: owner.email, fullName: owner.fullName }
    };
  });

  return variables;
};

export default getDemoteMembersVars;
