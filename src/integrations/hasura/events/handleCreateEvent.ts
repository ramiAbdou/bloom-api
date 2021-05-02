import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { EmailEvent, GoogleEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.CREATE_EVENT was handled successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleCreateEvent = async (
  payload: HasuraEventPayload
): Promise<boolean> => {
  const event = payload.event.data.new;

  emitEmailEvent({
    event: EmailEvent.CREATE_EVENT_COORDINATOR,
    payload: {
      communityId: event.communityId,
      coordinatorId: payload.event.sessionVariables.xHasuraMemberId,
      eventId: event.id
    }
  });

  emitGoogleEvent({
    event: GoogleEvent.CREATE_CALENDAR_EVENT,
    payload: { eventId: event.id }
  });

  return true;
};

export default handleCreateEvent;
