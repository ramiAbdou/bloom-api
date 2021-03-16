import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/constants.events';
import Event from '../Event';

export interface UpdateGoogleCalendarEventIdArgs {
  eventId: string;
  googleCalendarEventId?: string;
}

/**
 * Returns the updated Event.
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
    { googleCalendarEventId },
    { flushEvent: FlushEvent.UPDATE_GOOGLE_CALENDAR_EVENT_ID }
  );

  return event;
};

export default updateGoogleCalendarEventId;
