import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { EmailEvent, GoogleEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.CREATE_EVENT_GUEST was handled successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleCreateEventGuest = (payload: HasuraEventPayload): boolean => {
  const eventGuest = payload.event.data.new;

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { eventId: eventGuest.eventId, guestId: eventGuest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId: eventGuest.eventId,
    guestId: eventGuest.id
  });

  return true;
};

export default handleCreateEventGuest;
