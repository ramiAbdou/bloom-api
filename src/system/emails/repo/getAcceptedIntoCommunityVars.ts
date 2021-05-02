import { findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';

export interface AcceptedIntoCommunityPayload {
  communityId: string;
  memberId: string;
}

export interface AcceptedIntoCommunityVars {
  community: Pick<Community, 'name'>;
  loginUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns email variables for EmailEvent.ACCEPTED_TO_COMMUNITY.
 *
 * @param context.communityId - ID of the Community.
 * @param context.memberId - ID of the Member.
 */
const getAcceptedIntoCommunityVars = async ({
  communityId,
  memberId
}: AcceptedIntoCommunityPayload): Promise<AcceptedIntoCommunityVars[]> => {
  const [community, member]: [Community, Member] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Member, { id: memberId })
  ]);

  const variables: AcceptedIntoCommunityVars[] = [
    {
      community: { name: community.name },
      loginUrl: `${APP.CLIENT_URL}/login`,
      member: { email: member.email, firstName: member.firstName }
    }
  ];

  return variables;
};

export default getAcceptedIntoCommunityVars;
