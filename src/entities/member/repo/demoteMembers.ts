import { DemoteMembersPayload } from 'src/system/emails/util/getDemoteMembersVars';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, MutationEvent } from '@util/events';
import Member from '../Member';

@ArgsType()
export class DemoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the updated Members.
 *
 * @param {string[]} args.memberIds - IDs of the Members to delete.
 * @param {string} ctx.communityId - ID of the Community.
 */
const demoteMembers = async (
  args: DemoteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: null },
    { flushEvent: MutationEvent.DEMOTE_MEMBERS }
  );

  emitEmailEvent(EmailEvent.DEMOTE_MEMBERS, {
    communityId,
    memberIds
  } as DemoteMembersPayload);

  return members;
};

export default demoteMembers;
