import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { DeleteMembersContext } from '@core/emails/util/getDeleteMembersVars';
import emitEmailEvent from '@core/events/emitEmailEvent';
import { EmailEvent, FlushEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the soft-deleted [Member].
 *
 * @param {string[]} args.memberIds - IDs of the [Member] to delete.
 * @param {string} ctx.communityId - ID of the Community.
 */
const deleteMembers = async (
  args: DeleteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndDelete(
    Member,
    { id: memberIds },
    { flushEvent: FlushEvent.DELETE_MEMBERS, soft: true }
  );

  emitEmailEvent(
    EmailEvent.DELETE_MEMBERS,
    { communityId, memberIds } as DeleteMembersContext,
    { delay: 5000 }
  );

  return members;
};

export default deleteMembers;
