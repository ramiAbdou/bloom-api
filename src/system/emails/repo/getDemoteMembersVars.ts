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
 * @param context.communityId - ID of the Community.
 * @param context.memberIds - ID of the Member(s).
 */
const getDemoteMembersVars = async (
  context: EmailPayload
): Promise<DemoteMembersVars[]> => {
  const { communityId, memberIds } = context as DemoteMembersPayload;

  const bm: BloomManager = new BloomManager();

  const [community, owner, users]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    bm.em.findOne(Community, { id: communityId }),
    bm.em.findOne(Member, { community: communityId, role: MemberRole.OWNER }),
    bm.em.find(Member, { id: memberIds })
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
