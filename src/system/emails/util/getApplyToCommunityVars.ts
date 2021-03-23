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
 * Returns email variables for APPLY_TO_COMMUNITY.
 *
 * @param context.communityId - ID of the Community.
 * @param context.memberId - ID of the Member.
 */
const getApplyToCommunityVars = async (
  context: EmailPayload
): Promise<ApplyToCommunityVars[]> => {
  const { communityId, memberId } = context as ApplyToCommunityPayload;

  const bm: BloomManager = new BloomManager();

  const [community, user]: [Community, Member] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Member, { id: memberId })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialUser: Pick<Member, 'email' | 'firstName'> = {
    email: user.email,
    firstName: user.firstName
  };

  const variables: ApplyToCommunityVars[] = [
    { community: partialCommunity, member: partialUser }
  ];

  return variables;
};

export default getApplyToCommunityVars;
