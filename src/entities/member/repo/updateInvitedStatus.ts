import BloomManager from '@core/db/BloomManager';
import Member from '../Member';
import { MemberStatus } from '../Member.types';

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 */
export default async (members: Member[]) => {
  const bm = new BloomManager();

  await Promise.all(
    members.map(async (member: Member) => {
      if (member.status === 'INVITED') member.status = MemberStatus.ACCEPTED;
    })
  );

  await bm.flush({ event: 'INVITED_MEMBER_ACCEPTED' });
};
