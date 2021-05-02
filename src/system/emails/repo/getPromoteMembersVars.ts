import { find, findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member, { MemberRole } from '@entities/member/Member';

export interface PromoteMembersPayload {
  communityId: string;
  memberIds: string[];
}

export interface PromoteMembersVars {
  community: Pick<Community, 'name'>;
  member: Pick<Member, 'email' | 'firstName'>;
  owner: Pick<Member, 'email' | 'fullName'>;
}

/**
 * Returns the variables for the PROMOTE_MEMBERS email.
 *
 * @param context.communityId - ID of the Community.
 * @param context.memberIds - ID of the Member(s).
 */
const getPromoteMembersVars = async ({
  communityId,
  memberIds
}: PromoteMembersPayload): Promise<PromoteMembersVars[]> => {
  const [community, owner, members]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Member, { community: communityId, role: MemberRole.OWNER }),
    find(Member, { id: memberIds })
  ]);

  const variables: PromoteMembersVars[] = members.map((member: Member) => {
    return {
      community: { name: community.name },
      member: { email: member.email, firstName: member.firstName },
      owner: { email: owner.email, fullName: owner.fullName }
    };
  });

  return variables;
};

export default getPromoteMembersVars;
