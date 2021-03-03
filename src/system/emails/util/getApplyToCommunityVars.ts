import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface ApplyToCommunityPayload {
  communityId?: string;
  memberId?: string;
}

export interface ApplyToCommunityVars {
  community: Pick<Community, 'name'>;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns email variables for APPLY_TO_COMMUNITY.
 *
 * @param {string} context.communityId
 * @param {string} context.memberId
 */
const getApplyToCommunityVars = async (
  context: EmailPayload
): Promise<ApplyToCommunityVars[]> => {
  const { communityId, memberId } = context as ApplyToCommunityPayload;

  const bm = new BloomManager();

  const [community, user]: [Community, User] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(User, { members: { id: memberId } })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialUser: Pick<User, 'email' | 'firstName'> = {
    email: user.email,
    firstName: user.firstName
  };

  const variables: ApplyToCommunityVars[] = [
    { community: partialCommunity, user: partialUser }
  ];

  return variables;
};

export default getApplyToCommunityVars;
