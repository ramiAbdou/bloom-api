import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { AcceptedIntoCommunityPayload } from '@core/emails/util/getAcceptedIntoCommunityVars';
import { emitEmailEvent } from '@core/eventBus';
import { EmailEvent, FlushEvent } from '@util/events';
import Member, { MemberStatus } from '../Member';

interface AcceptInvitationsArgs {
  email?: string;
  memberIds?: string[];
}

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 *
 * @param {AcceptInvitationsArgs} args
 * @param {string} args.email
 * @param {string[]} args.memberIds
 */
const acceptInvitations = async (
  args: AcceptInvitationsArgs
): Promise<Member[]> => {
  const queryArgs: FilterQuery<Member> = args.email
    ? { user: { email: args.email } }
    : { id: args.memberIds };

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { ...queryArgs, status: MemberStatus.INVITED },
    { status: MemberStatus.ACCEPTED },
    { flushEvent: FlushEvent.ACCEPT_INVITATIONS }
  );

  members.forEach((member: Member) => {
    emitEmailEvent(EmailEvent.ACCEPTED_INTO_COMMUNITY, {
      communityId: member.community.id,
      memberIds: [member.id]
    } as AcceptedIntoCommunityPayload);
  });

  return members;
};

export default acceptInvitations;
