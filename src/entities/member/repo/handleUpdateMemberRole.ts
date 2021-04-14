import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
// import * as emitEmailEvent from '@system/events/repo/emitEmailEvent';
// import { EmailEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.UPDATE_MEMBER_ROLES was handled successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleUpdateMemberRole = (payload: HasuraEventPayload): boolean => {
  const member = payload.event.data.new;

  // emitEmailEvent(EmailEvent.PROMOTE_MEMBERS, {
  //   communityId: event.communityId,
  //   memberIds
  // });

  // console.log(payload.event.data);

  return true;
};

export default handleUpdateMemberRole;
