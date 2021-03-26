import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { DemoteMembersPayload } from '@system/emails/repo/getDemoteMembersVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent } from '@util/constants.events';
import Member from '../Member';

@ArgsType()
export class DemoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the demoted Member(s).
 *
 * @param args.memberIds - IDs of the Member(s) to delete.
 * @param ctx.communityId - ID of the Community (authenticated).
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
    { role: null }
  );

  emitEmailEvent(EmailEvent.DEMOTE_MEMBERS, {
    communityId,
    memberIds
  } as DemoteMembersPayload);

  return members;
};

export default demoteMembers;
