import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member, { MemberRole } from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

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
 * @param {DeleteMembersPayload} context
 * @param {string} context.communityId
 * @param {string[]} context.memberIds
 */
const getPromoteMembersVars = async (
  context: EmailPayload
): Promise<PromoteMembersVars[]> => {
  const { communityId, memberIds } = context as PromoteMembersPayload;

  const bm = new BloomManager();

  const [community, owner, members]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Member, {
      community: communityId,
      role: MemberRole.OWNER
    }),
    bm.find(Member, { id: memberIds })
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
