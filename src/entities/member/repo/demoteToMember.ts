import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';
import { AdminArgs } from '../Member.types';

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
export default async (
  { memberIds }: AdminArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: null },
    { event: 'MEMBERS_DEMOTED' }
  );

  // Invalidate the cache for the GET_DATABASE call.
  cache.invalidateEntries([`${QueryEvent.GET_DATABASE}-${communityId}`]);
  return members;
};
