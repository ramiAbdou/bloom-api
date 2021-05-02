import { find, findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member, { MemberRole } from '@entities/member/Member';

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
const getDemoteMembersVars = async ({
  communityId,
  memberIds
}: DemoteMembersPayload): Promise<DemoteMembersVars[]> => {
  const [community, owner, users]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Member, { community: communityId, role: MemberRole.OWNER }),
    find(Member, { id: memberIds })
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
