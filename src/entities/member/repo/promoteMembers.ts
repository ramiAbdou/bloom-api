import { PromoteMembersPayload } from 'src/system/emails/util/getPromoteMembersVars';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/events';
import Member, { MemberRole } from '../Member';

@ArgsType()
export class PromoteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

/**
 * Returns the promoted Members.
 *
 * @param args.memberIds - IDs of the Member(s) to delete.
 * @param ctx.communityId - ID of the Community.
 */
const promoteMembers = async (
  args: PromoteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    memberIds,
    { role: MemberRole.ADMIN },
    { flushEvent: FlushEvent.PROMOTE_MEMBERS }
  );

  emitEmailEvent(EmailEvent.PROMOTE_MEMBERS, {
    communityId,
    memberIds
  } as PromoteMembersPayload);

  return members;
};

export default promoteMembers;
