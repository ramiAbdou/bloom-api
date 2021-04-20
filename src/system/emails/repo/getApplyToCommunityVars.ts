import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

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
const getApplyToCommunityVars = async (
  context: EmailPayload
): Promise<ApplyToCommunityVars[]> => {
  const { communityId, memberId } = context as ApplyToCommunityPayload;

  const bm: BloomManager = new BloomManager();

  const [community, member]: [Community, Member] = await Promise.all([
    bm.em.findOne(Community, { id: communityId }),
    bm.em.findOne(Member, { id: memberId })
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
