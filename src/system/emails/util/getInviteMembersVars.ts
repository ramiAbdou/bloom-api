import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { buildUrl, signToken } from '@util/util';
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
 * @param context.communityId - ID of the Community.
 * @param context.coordinatorId - ID of the Member (admin).
 * @param context.memberId - ID of the Member.
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
    const token: string = signToken({
      expires: false,
      payload: { memberId: member.id }
    });

    const invitationUrl: string = buildUrl({
      params: { token },
      url: `${APP.CLIENT_URL}/${community.urlName}`
    });

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
