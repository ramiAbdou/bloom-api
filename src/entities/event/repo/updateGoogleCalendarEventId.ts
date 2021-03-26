import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

export interface UpdateGoogleCalendarEventIdArgs {
  eventId: string;
  googleCalendarEventId?: string;
}

/**
 * Returns the updated Event.
 *
 * Precondition: Should only be called for an upcoming Event.
 *
 * @param args.eventId - ID of the Event.
 * @param args.googleCalendarEventId - ID of the Google Calendar event.
 */
const updateGoogleCalendarEventId = async (
  args: UpdateGoogleCalendarEventIdArgs
): Promise<Event> => {
  const { eventId, googleCalendarEventId } = args;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    eventId,
    { googleCalendarEventId }
  );

  return event;
};

export default updateGoogleCalendarEventId;
