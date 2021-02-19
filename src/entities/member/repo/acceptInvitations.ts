import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Member from '../Member';
import { MemberStatus } from '../Member.types';

interface UpdateInvitedStatusesArgs {
  email: string;
}

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 */
const acceptInvitations = async ({
  email
}: UpdateInvitedStatusesArgs): Promise<Member[]> => {
  const bm = new BloomManager();
  const members: Member[] = await bm.find(Member, { user: { email } });

  members.forEach((member: Member) => {
    if (member.status === MemberStatus.INVITED) {
      member.status = MemberStatus.ACCEPTED;
    }
  });

  await bm.flush(FlushEvent.ACCEPT_INVITATIONS);
  return members;
};

export default acceptInvitations;
