import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { EmailPayload } from '../emails.types';

export interface AcceptedIntoCommunityPayload {
  communityId: string;
  memberIds: string[];
}

export interface AcceptedIntoCommunityVars {
  community: Pick<Community, 'name'>;
  loginUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns email variables for ACCEPTED_TO_COMMUNITY.
 *
 * @param {string} context.communityId
 * @param {string} context.memberId
 */
const getAcceptedIntoCommunityVars = async (
  context: EmailPayload
): Promise<AcceptedIntoCommunityVars[]> => {
  const { communityId, memberIds } = context as AcceptedIntoCommunityPayload;

  const bm = new BloomManager();

  const [community, members]: [Community, Member[]] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.find(Member, { id: memberIds })
  ]);

  const variables: AcceptedIntoCommunityVars[] = members.map(
    (member: Member) => {
      return {
        community: { name: community.name },
        loginUrl: `${APP.CLIENT_URL}/login`,
        member: { email: member.email, firstName: member.firstName }
      };
    }
  );

  return variables;
};

export default getAcceptedIntoCommunityVars;
