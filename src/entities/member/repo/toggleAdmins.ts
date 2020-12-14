import { ArgsType, Field } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class ToggleAdminArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
export default async (
  { memberIds }: ToggleAdminArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const bm = new BloomManager();

  const members: Member[] = await bm.find(Member, { id: memberIds });

  members.forEach((member: Member) => {
    if (!member.role) member.role = 'ADMIN';
    else member.role = null;
  });

  await bm.flush('MEMBERSHIPS_ADMIN_STATUS_UPDATED');

  // Invalidate the cache for the GET_MEMBERS call.
  cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

  return members;
};
