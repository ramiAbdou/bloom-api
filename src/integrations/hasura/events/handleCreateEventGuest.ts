import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { EmailEvent, GoogleEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.CREATE_EVENT_GUEST was handled successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleCreateEventGuest = async (
  payload: HasuraEventPayload
): Promise<boolean> => {
  const eventGuest = payload.event.data.new;

  emitEmailEvent({
    event: EmailEvent.EVENT_RSVP,
    payload: { eventId: eventGuest.eventId, guestId: eventGuest.id }
  });

  emitGoogleEvent({
    event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE,
    payload: { eventId: eventGuest.eventId, guestId: eventGuest.id }
  });

  return true;
};

export default handleCreateEventGuest;
