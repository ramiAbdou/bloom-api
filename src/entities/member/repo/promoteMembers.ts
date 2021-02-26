import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { PromoteMembersContext } from '@core/emails/util/getPromoteMembersVars';
import emitEmailEvent from '@core/events/emitEmailEvent';
import { EmailEvent, FlushEvent } from '@util/events';
import Member, { MemberRole } from '../Member';

@ArgsType()
export class PromoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the updated Members.
 *
 * @param {string[]} args.memberIds - IDs of the Members to delete.
 * @param {string} ctx.communityId - ID of the Community.
 */
const promoteMembers = async (
  args: PromoteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    { role: MemberRole.ADMIN },
    { flushEvent: FlushEvent.PROMOTE_MEMBERS }
  );

  emitEmailEvent(EmailEvent.PROMOTE_MEMBERS, {
    communityId,
    memberIds
  } as PromoteMembersContext);

  return members;
};

export default promoteMembers;
