import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Member, { MemberRole } from '../Member';

@ArgsType()
export class PromoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
const promoteMembers = async ({
  memberIds
}: PromoteMembersArgs): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: MemberRole.ADMIN },
    { flushEvent: FlushEvent.PROMOTE_MEMBERS }
  );

  return members;
};

export default promoteMembers;
