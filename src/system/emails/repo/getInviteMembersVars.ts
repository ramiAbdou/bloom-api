import { find, findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';

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
const getInviteMembersVars = async ({
  communityId,
  coordinatorId,
  memberIds
}: InviteMembersPayload): Promise<InviteMembersVars[]> => {
  const [community, coordinator, members]: [
    Community,
    Member,
    Member[]
  ] = await Promise.all([
    findOne(Community, communityId),
    findOne(Member, coordinatorId),
    find(Member, { id: memberIds })
  ]);

  const variables: InviteMembersVars[] = members.map((member: Member) => {
    const loginToken: string = signToken({
      expires: false,
      payload: { event: VerifyEvent.LOGIN, memberId: member.id }
    });

    const invitationUrl: string = buildUrl({
      params: { token: loginToken },
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
