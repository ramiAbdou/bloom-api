import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { MutationEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class RestoreMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

const restoreMembers = async ({
  memberIds
}: RestoreMembersArgs): Promise<Member[]> => {
  return new BloomManager().findAndRestore(
    Member,
    { id: memberIds },
    { flushEvent: MutationEvent.RESTORE_MEMBERS }
  );
};

export default restoreMembers;
