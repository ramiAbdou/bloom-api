import { findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';

export interface ApplyToCommunityPayload {
  communityId?: string;
  memberId?: string;
}

export interface ApplyToCommunityVars {
  community: Pick<Community, 'name'>;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns email variables for EmailEvent.APPLY_TO_COMMUNITY.
 *
 * @param context.communityId - ID of the Community.
 * @param context.memberId - ID of the Member.
 */
const getApplyToCommunityVars = async ({
  communityId,
  memberId
}: ApplyToCommunityPayload): Promise<ApplyToCommunityVars[]> => {
  const [community, member]: [Community, Member] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Member, { id: memberId })
  ]);

  const variables: ApplyToCommunityVars[] = [
    {
      community: { name: community.name },
      member: { email: member.email, firstName: member.firstName }
    }
  ];

  return variables;
};

export default getApplyToCommunityVars;
