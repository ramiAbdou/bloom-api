import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
// import * as emitEmailEvent from '@system/events/repo/emitEmailEvent';
// import { EmailEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.UPDATE_MEMBER_STATUS was handled
 * successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleUpdateMemberStatus = (payload: HasuraEventPayload): boolean => {
  const member = payload.event.data.new;

  // if (response === MemberStatus.ACCEPTED) {
  //   emitEmailEvent(EmailEvent.ACCEPTED_INTO_COMMUNITY, {
  //     communityId,
  //     memberIds
  //   } as AcceptedIntoCommunityPayload);

  //   memberIds.forEach((memberId: string) => {
  //     emitMailchimpEvent(MailchimpEvent.ADD_TO_AUDIENCE, {
  //       communityId,
  //       memberId
  //     });
  //   });
  // }

  return true;
};

export default handleUpdateMemberStatus;
