import BloomManager from '@core/db/BloomManager';
import { AcceptedIntoCommunityContext } from '@core/emails/util/getAcceptedIntoCommunityVars';
import emitEmailEvent from '@core/events/emitEmailEvent';
import { EmailEvent, FlushEvent } from '@util/events';
import Member, { MemberStatus } from '../Member';

interface AcceptInvitationsArgs {
  email: string;
}

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 *
 * @param {AcceptInvitationsArgs} args
 * @param {string} args.email
 */
const acceptInvitations = async (
  args: AcceptInvitationsArgs
): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { status: MemberStatus.INVITED, user: { email: args.email } },
    { status: MemberStatus.ACCEPTED },
    { flushEvent: FlushEvent.ACCEPT_INVITATIONS }
  );

  members.forEach((member: Member) => {
    emitEmailEvent(EmailEvent.ACCEPTED_INTO_COMMUNITY, {
      communityId: member.community.id,
      memberIds: [member.id]
    } as AcceptedIntoCommunityContext);
  });

  return members;
};

export default acceptInvitations;
