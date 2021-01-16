import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

export default async (
  { memberIds }: DeleteMembersArgs,
  { communityId }: GQLContext
): Promise<boolean> => {
  const bm = new BloomManager();

  const members: Member[] = await bm.find(Member, { id: memberIds });

  await bm.deleteAndFlush(members);
  cache.invalidateEntries([`${QueryEvent.GET_MEMBERS}-${communityId}`]);

  // If any of the members were an ADMIN of the community, then we need to
  // invalidate the GET_ADMINS cache key.
  if (members.some(({ role }) => !!role)) {
    cache.invalidateEntries([`${QueryEvent.GET_MEMBERS}-${communityId}`]);
  }

  return true;
};
