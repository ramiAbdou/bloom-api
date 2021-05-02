import { find, findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';

export interface ApplyToCommunityAdminsPayload {
  applicantId: string; // ID of the Member who applied.
  communityId: string;
}

export interface ApplyToCommunityAdminsVars {
  applicant: Pick<Member, 'fullName'>;
  applicantUrl: string;
  community: Pick<Community, 'name'>;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns email variables for EmailEvent.APPLY_TO_COMMUNITY_ADMINS.
 *
 * @param context.applicantId - ID of the Member (status: PENDING).
 * @param context.memberId - ID of the Member.
 */
const getApplyToCommunityAdminsVars = async ({
  applicantId,
  communityId
}: ApplyToCommunityAdminsPayload): Promise<ApplyToCommunityAdminsVars[]> => {
  const [community, admins, applicant]: [
    Community,
    Member[],
    Member
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    find(Member, { community: communityId, role: { $ne: null } }),
    findOne(Member, { id: applicantId })
  ]);

  const variables: ApplyToCommunityAdminsVars[] = admins.map(
    (member: Member) => {
      return {
        applicant: { fullName: applicant.fullName },
        applicantUrl: `${APP.CLIENT_URL}/${community.urlName}/applicants`,
        community: { name: community.name },
        member: { email: member.email, firstName: member.firstName }
      };
    }
  );

  return variables;
};

export default getApplyToCommunityAdminsVars;
