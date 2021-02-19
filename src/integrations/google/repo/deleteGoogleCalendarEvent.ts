import { FlushEvent } from '@constants';
import logger from '@util/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Deletes the Google Calendar event.
 *
 * @param eventId ID of the event.
 */
const deleteGoogleCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    await eventsCalendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId
    });

    logger.log({
      event: FlushEvent.DELETE_GOOGLE_CALENDAR_EVENT,
      level: 'INFO'
    });

    return true;
  } catch (e) {
    logger.log({
      error: e,
      event: FlushEvent.DELETE_GOOGLE_CALENDAR_EVENT,
      level: 'ERROR'
    });

    throw new Error(`Couldn't delete Google Calendar event.`);
  }
};

export default deleteGoogleCalendarEvent;
