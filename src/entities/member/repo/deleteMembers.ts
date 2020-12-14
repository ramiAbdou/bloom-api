import { ArgsType, Field } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
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
  const memberRepo = bm.memberRepo();

  const members: Member[] = await memberRepo.find({ id: memberIds }, ['user']);

  await memberRepo.deleteAndFlush(members, 'MEMBERSHIPS_DELETED');
  cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

  // If any of the members were an ADMIN of the community, then we need to
  // invalidate the GET_ADMINS cache key.
  if (members.some(({ role }) => !!role)) {
    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
  }

  return true;
};
