import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';
import { MemberStatus } from '../Member.types';

interface UpdateInvitedStatusesArgs {
  communityId: string;
  email: string;
}

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 */
const updateInvitedStatuses = async ({
  communityId,
  email
}: UpdateInvitedStatusesArgs): Promise<Member[]> => {
  const bm = new BloomManager();
  const members: Member[] = await bm.find(Member, { user: { email } });

  members.forEach((member: Member) => {
    if (member.status === 'INVITED') member.status = MemberStatus.ACCEPTED;
  });

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_DATABASE}-${communityId}`,
      `${QueryEvent.GET_DIRECTORY}-${communityId}`
    ],
    event: 'ACCEPT_INVITE_STATUS'
  });

  return members;
};

export default updateInvitedStatuses;
