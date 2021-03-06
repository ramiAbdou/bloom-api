import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { MutationEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class RestoreMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

const restoreMembers = async (args: RestoreMembersArgs): Promise<Member[]> => {
  const { memberIds } = args;

  const members: Member[] = await new BloomManager().findAndRestore(
    Member,
    memberIds,
    { flushEvent: MutationEvent.RESTORE_MEMBERS }
  );

  return members;
};

export default restoreMembers;
