import jwt from 'jsonwebtoken';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP, JWT } from '@util/constants';
import URLBuilder from '@util/URLBuilder';
import { EmailPayload } from '../emails.types';

export interface InviteMembersPayload {
  communityId: string;
  coordinatorId: string;
  memberIds: string[];
}

export interface InviteMembersVars {
  community: Pick<Community, 'name'>;
  coordinator: Pick<Member, 'fullName'>;
  invitationUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns email variables for INVITE_MEMBERS.
 *
 * @param {string} context.communityId
 * @param {string} context.coordinatorId
 * @param {string} context.memberId
 */
const getInviteMembersVars = async (
  context: EmailPayload
): Promise<InviteMembersVars[]> => {
  const {
    communityId,
    coordinatorId,
    memberIds
  } = context as InviteMembersPayload;

  const bm = new BloomManager();

  const [community, coordinator, members]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, communityId),
    bm.findOne(Member, coordinatorId),
    bm.find(Member, { id: memberIds })
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
      member: { email: member.email, firstName: member.firstName }
    };
  });

  return variables;
};

export default getInviteMembersVars;
