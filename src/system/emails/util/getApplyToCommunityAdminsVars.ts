import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { EmailPayload } from '../emails.types';

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
 * Returns email variables for APPLY_TO_COMMUNITY_ADMINS.
 *
 * @param {string} context.applicantId
 * @param {string} context.memberId
 */
const getApplyToCommunityAdminsVars = async (
  context: EmailPayload
): Promise<ApplyToCommunityAdminsVars[]> => {
  const { applicantId, communityId } = context as ApplyToCommunityAdminsPayload;

  const bm = new BloomManager();

  const [community, admins, applicant]: [
    Community,
    Member[],
    Member
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.find(Member, { community: communityId, role: { $ne: null } }),
    bm.findOne(Member, { id: applicantId })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialApplicant: Pick<Member, 'fullName'> = {
    fullName: applicant.fullName
  };

  const variables: ApplyToCommunityAdminsVars[] = admins.map(
    (admin: Member) => {
      return {
        applicant: partialApplicant,
        applicantUrl: `${APP.CLIENT_URL}/${community.urlName}/applicants`,
        community: partialCommunity,
        member: { email: admin.email, firstName: admin.firstName }
      };
    }
  );

  return variables;
};

export default getApplyToCommunityAdminsVars;
