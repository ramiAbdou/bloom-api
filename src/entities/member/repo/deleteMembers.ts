import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { DeleteMembersPayload } from '@system/emails/repo/getDeleteMembersVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent } from '@util/constants.events';
import { now } from '@util/util';
import Member from '../Member';

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the soft-deleted Member(s).
 *
 * @param args.memberIds - IDs of the Member(s) to delete.
 * @param ctx.communityId - ID of the Community.
 */
const deleteMembers = async (
  args: DeleteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { deletedAt: now() }
  );

  emitEmailEvent(
    EmailEvent.DELETE_MEMBERS,
    { communityId, memberIds } as DeleteMembersPayload,
    { delay: 5000 }
  );

  return members;
};

export default deleteMembers;
