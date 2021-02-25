import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface InviteMembersContext {
  communityId: string;
  coordinatorId: string;
  memberIds: string[];
}

export interface InviteMembersVars {
  community: Pick<Community, 'name'>;
  coordinator: Pick<User, 'fullName'>;
  invitationUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns email variables for INVITE_MEMBERS.
 *
 * @param {string} context.communityId
 * @param {string} context.coordinatorId
 * @param {string} context.memberId
 */
const getInviteMembersVars = async (
  context: EmailContext
): Promise<InviteMembersVars[]> => {
  const {
    communityId,
    coordinatorId,
    memberIds
  } = context as InviteMembersContext;

  const bm = new BloomManager();

  const [community, coordinator, users]: [
    Community,
    User,
    User[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(User, { members: { id: coordinatorId } }),
    bm.find(User, { members: { id: memberIds } })
  ]);

  const variables: InviteMembersVars[] = users.map((user: User) => {
    return {
      community: { name: community.name },
      coordinator: { fullName: coordinator.fullName },
      invitationUrl: `${APP.CLIENT_URL}/${community.urlName}`,
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getInviteMembersVars;
