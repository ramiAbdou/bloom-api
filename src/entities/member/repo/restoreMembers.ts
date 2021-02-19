import { ArgsType, Field } from 'type-graphql';

import { FlushEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
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
    { event: FlushEvent.RESTORE_MEMBERS }
  );
};

export default restoreMembers;
