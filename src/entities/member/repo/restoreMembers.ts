import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class RestoreMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

const restoreMembers = async (
  { memberIds }: RestoreMembersArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  return new BloomManager().findAndRestore(
    Member,
    { id: memberIds },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_DATABASE}-${communityId}`,
        `${QueryEvent.GET_DIRECTORY}-${communityId}`
      ],
      event: 'RESTORE_MEMBERS'
    }
  );
};

export default restoreMembers;
