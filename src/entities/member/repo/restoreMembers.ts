import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
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
    memberIds
  );

  return members;
};

export default restoreMembers;
