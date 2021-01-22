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
  return new BloomManager().findAndDelete(
    Member,
    { id: memberIds },
    { cacheKeysToInvalidate: [`${QueryEvent.GET_DATABASE}-${communityId}`] }
  );
};

export default deleteMembers;
