import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

const deleteMembers = async (
  { memberIds }: DeleteMembersArgs,
  { communityId }: GQLContext
): Promise<boolean> => {
  const bm = new BloomManager();
  const members: Member[] = await bm.find(Member, { id: memberIds });

  await bm.deleteAndFlush({
    cacheKeysToInvalidate: [`${QueryEvent.GET_DATABASE}-${communityId}`],
    entities: members
  });

  return true;
};

export default deleteMembers;
