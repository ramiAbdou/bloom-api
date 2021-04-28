import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { AcceptedIntoCommunityPayload } from '@system/emails/repo/getAcceptedIntoCommunityVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent } from '@util/constants.events';
import { now } from '@util/util';
import Member, { MemberStatus } from '../Member';

@ArgsType()
export class RespondToApplicantsArgs {
  @Field(() => [String])
  memberIds: string[];

  @Field(() => String)
  response: MemberStatus;
}

/**
 * An admin has the option to either accept or reject a Member when they
 * apply to the organization.
 *
 * @param args.memberIds - IDs of Member(s) to either ACCEPT/REJECT.
 * @param args.response - ACCEPTED or REJECTED
 */
const respondToApplicants = async (
  args: RespondToApplicantsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { memberIds, response } = args;
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { id: memberIds },
    {
      joinedAt: response === MemberStatus.ACCEPTED ? now() : null,
      status: response
    }
  );

  if (response === MemberStatus.ACCEPTED) {
    emitEmailEvent(EmailEvent.ACCEPTED_INTO_COMMUNITY, {
      communityId,
      memberIds
    } as AcceptedIntoCommunityPayload);
  }

  return members;
};

export default respondToApplicants;
