import jwt from 'jsonwebtoken';

import { APP, JWT } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community, Member, User } from '@entities/entities';
import URLBuilder from '@util/URLBuilder';
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

  const [community, coordinator, members]: [
    Community,
    User,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(User, { members: { id: coordinatorId } }),
    bm.find(Member, { id: memberIds }, { populate: ['user'] })
  ]);

  const variables: InviteMembersVars[] = members.map((member: Member) => {
    const token: string = jwt.sign({ memberId: member.id }, JWT.SECRET);

    const invitationUrl: string = new URLBuilder(
      `${APP.CLIENT_URL}/${community.urlName}`
    ).addParam('token', token).url;

    return {
      community: { name: community.name },
      coordinator: { fullName: coordinator.fullName },
      invitationUrl,
      user: { email: member.user.email, firstName: member.user.firstName }
    };
  });

  return variables;
};

export default getInviteMembersVars;
