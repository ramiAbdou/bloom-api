import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';
import { AdminArgs } from '../Member.types';

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
const demoteMembers = async (
  { memberIds }: AdminArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: null },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_DATABASE}-${communityId}`],
      event: 'MEMBERS_DEMOTED'
    }
  );

  return members;
};

export default demoteMembers;
