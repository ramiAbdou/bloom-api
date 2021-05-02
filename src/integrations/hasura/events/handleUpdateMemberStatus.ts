import { MemberStatus } from '@entities/member/Member';
import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { EmailEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.UPDATE_MEMBER_STATUS was handled
 * successfully.
 *
 * Sends a welcome email to the community.
 *
 * @param payload - Hasura event payload to process.
 */
const handleUpdateMemberStatus = (payload: HasuraEventPayload): boolean => {
  const member = payload.event.data.new;

  if (member.status === MemberStatus.ACCEPTED) {
    emitEmailEvent({
      event: EmailEvent.ACCEPTED_INTO_COMMUNITY,
      payload: { communityId: member.communityId, memberId: member.id }
    });
  }

  return true;
};

export default handleUpdateMemberStatus;
