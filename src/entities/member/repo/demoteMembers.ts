import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class DemoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
const demoteMembers = async ({
  memberIds
}: DemoteMembersArgs): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: null },
    { flushEvent: FlushEvent.DEMOTE_MEMBERS }
  );

  return members;
};

export default demoteMembers;
