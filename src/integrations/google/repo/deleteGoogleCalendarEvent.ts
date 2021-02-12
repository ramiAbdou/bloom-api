import logger from '@util/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Deletes the Google Calendar event.
 *
 * @param eventId ID of the event.
 */
const deleteGoogleCalendarEvent = async (eventId: string): Promise<boolean> => {
  const response = await eventsCalendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId
  });

  logger.log({
    error: response.statusText,
    event: 'DELETE_GOOGLE_CALENDAR_EVENT',
    level: response.status < 300 ? 'INFO' : 'ERROR'
  });

  return true;
};

export default deleteGoogleCalendarEvent;
