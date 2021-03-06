import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { AcceptedIntoCommunityPayload } from '@system/emails/repo/getAcceptedIntoCommunityVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { EmailEvent } from '@util/constants.events';
import Member, { MemberStatus } from '../Member';

interface AcceptInvitationsArgs {
  email?: string;
  memberIds?: string[];
}

/**
 * Updates all of the INVITED statuses to ACCEPTED on a member.
 * Precondition: Should only be called when a user is logging into Bloom.
 *
 * @param args.email - Email of the Member to accept.
 * @param args.memberIds - IDs of the Member(s) to accept.
 */
const acceptInvitations = async (
  args: AcceptInvitationsArgs
): Promise<Member[]> => {
  const { email, memberIds } = args;

  const queryArgs: FilterQuery<Member> = email ? { email } : { id: memberIds };

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { ...queryArgs, status: MemberStatus.INVITED },
    { status: MemberStatus.ACCEPTED }
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
