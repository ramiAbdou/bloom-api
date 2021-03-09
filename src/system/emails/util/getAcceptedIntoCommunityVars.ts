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
 * @param context.communityId - ID of the Community.
 * @param context.memberId - ID of the Member.
 */
const getAcceptedIntoCommunityVars = async (
  context: EmailPayload
): Promise<AcceptedIntoCommunityVars[]> => {
  const { communityId, memberIds } = context as AcceptedIntoCommunityPayload;

  const bm = new BloomManager();

  const [community, members]: [Community, Member[]] = await Promise.all([
    bm.findOne(Community, communityId),
    bm.find(Member, memberIds)
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
