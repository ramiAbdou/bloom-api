import { GoogleEvent } from '@util/events';
import logger from '@util/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Deletes the Google Calendar event.
 *
 * @param eventId ID of the event.
 */
const deleteGoogleCalendarEvent = async (eventId: string): Promise<boolean> => {
  if (!eventId) return false;

  try {
    await eventsCalendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId
    });

    logger.log({
      event: GoogleEvent.DELETE_CALENDAR_EVENT,
      level: 'INFO'
    });

    return true;
  } catch (e) {
    logger.log({
      error: e,
      event: GoogleEvent.DELETE_CALENDAR_EVENT,
      level: 'ERROR'
    });

    throw new Error(`Couldn't delete Google Calendar event.`);
  }
};

export default deleteGoogleCalendarEvent;
