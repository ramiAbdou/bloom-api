import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class RestoreMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the restored Member(s).
 *
 * @param args.memberIds IDs of the Member(s).
 */
const restoreMembers = async (args: RestoreMembersArgs): Promise<Member[]> => {
  const { memberIds } = args;

  const members: Member[] = await new BloomManager().findAndRestore(
    Member,
    memberIds,
    { flushEvent: FlushEvent.RESTORE_MEMBERS }
  );

  return members;
};

export default restoreMembers;
