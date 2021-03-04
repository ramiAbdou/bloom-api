import { APP } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface ApplyToCommunityAdminsPayload {
  applicantId: string; // ID of the Member who applied.
  communityId: string;
}

export interface ApplyToCommunityAdminsVars {
  applicant: Pick<User, 'fullName'>;
  applicantUrl: string;
  community: Pick<Community, 'name'>;
  user: Pick<User, 'email' | 'firstName'>;
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
    User[],
    User
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.find(User, { members: { community: communityId, role: { $ne: null } } }),
    bm.findOne(User, { members: { id: applicantId } })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialApplicant: Pick<User, 'fullName'> = {
    fullName: applicant.fullName
  };

  const variables: ApplyToCommunityAdminsVars[] = admins.map((admin: User) => {
    return {
      applicant: partialApplicant,
      applicantUrl: `${APP.CLIENT_URL}/${community.urlName}/applicants`,
      community: partialCommunity,
      user: { email: admin.email, firstName: admin.firstName }
    };
  });

  return variables;
};

export default getApplyToCommunityAdminsVars;