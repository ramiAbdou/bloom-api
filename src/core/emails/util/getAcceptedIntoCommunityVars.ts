import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface AcceptedIntoCommunityContext {
  communityId: string;
  memberIds: string[];
}

export interface AcceptedIntoCommunityVars {
  community: Pick<Community, 'name'>;
  loginUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns email variables for ACCEPTED_TO_COMMUNITY.
 *
 * @param {string} context.communityId
 * @param {string} context.memberId
 */
const getAcceptedIntoCommunityVars = async (
  context: EmailContext
): Promise<AcceptedIntoCommunityVars[]> => {
  const { communityId, memberIds } = context as AcceptedIntoCommunityContext;

  const bm = new BloomManager();

  const [community, users]: [Community, User[]] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.find(User, { members: { id: memberIds } })
  ]);

  const variables: AcceptedIntoCommunityVars[] = users.map((user: User) => {
    return {
      community: { name: community.name },
      loginUrl: `${APP.CLIENT_URL}/login`,
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getAcceptedIntoCommunityVars;
