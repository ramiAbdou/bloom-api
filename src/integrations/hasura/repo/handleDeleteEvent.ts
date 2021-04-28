import { HasuraEventPayload } from '@integrations/hasura/Hasura.types';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { EmailEvent, GoogleEvent } from '@util/constants.events';

/**
 * Returns true if the HasuraEvent.DELETE_EVENT was handled successfully.
 *
 * @param payload - Hasura event payload to process.
 */
const handleDeleteEvent = (payload: HasuraEventPayload): boolean => {
  const event = payload.event.data.old;

  // Send email to the admin/coordinator who deleted the event.
  emitEmailEvent(EmailEvent.DELETE_EVENT_COORDINATOR, {
    communityId: event.communityId,
    coordinatorId: payload.event.sessionVariables.xHasuraMemberId,
    eventId: event.id
  });

  // Send email to all of the people who RSVP'd and were planning to attend.
  emitEmailEvent(EmailEvent.DELETE_EVENT_GUESTS, {
    communityId: event.communityId,
    eventId: event.id
  });

  // Delete the Google Calendar event.
  emitGoogleEvent(GoogleEvent.DELETE_CALENDAR_EVENT, { eventId: event.id });

  return true;
};

export default handleDeleteEvent;