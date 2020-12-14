import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 */
export default async (members: Member[]) => {
  const bm = new BloomManager();

  await Promise.all(
    members.map(async (member: Member) => {
      if (member.status === 'INVITED') member.status = 'ACCEPTED';
    })
  );

  await bm.flush('MEMBERSHIPS_INVITED_STATUS_UPDATED');
};
