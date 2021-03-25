import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member, { MemberRole } from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

export interface DeleteMembersPayload {
  communityId: string;
  memberIds: string[];
}

export interface DeleteMembersVars {
  community: Pick<Community, 'name'>;
  member: Pick<Member, 'email' | 'firstName'>;
  owner: Pick<Member, 'email' | 'fullName'>;
}

/**
 * Returns the variables for the DELETE_MEMBERS email.
 *
 * @param context.communityId - ID of the Community.
 * @param context.memberIds - ID of the Member(s).
 */
const getDeleteMembersVars = async (
  context: EmailPayload
): Promise<DeleteMembersVars[]> => {
  const { communityId, memberIds } = context as DeleteMembersPayload;

  const bm = new BloomManager();

  const [community, owner, members]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, communityId),
    bm.findOne(Member, { community: communityId, role: MemberRole.OWNER }),
    bm.find(Member, memberIds)
  ]);

  const variables: DeleteMembersVars[] = members.map((member: Member) => {
    return {
      community: { name: community.name },
      member: { email: member.email, firstName: member.firstName },
      owner: { email: owner.email, fullName: owner.fullName }
    };
  });

  return variables;
};

export default getDeleteMembersVars;
