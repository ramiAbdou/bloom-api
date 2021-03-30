import logger from '@system/logger';
import { GoogleEvent } from '@util/constants.events';
import { eventsCalendar } from '../Google.util';

/**
 * Returns true if the Google Calendar event was deleted successfully.
 *
 * @param eventId - ID of the Google Calendar event.
 */
const deleteGoogleCalendarEvent = async (eventId: string): Promise<boolean> => {
  if (!eventId) return false;

  try {
    await eventsCalendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId
    });

    logger.info({
      event: GoogleEvent.DELETE_CALENDAR_EVENT,
      googleCalendarEventId: eventId,
      message: 'Deleted Google Calendar event'
    });

    return true;
  } catch (error) {
    logger.error({
      error,
      event: GoogleEvent.DELETE_CALENDAR_EVENT,
      googleCalendarEventId: eventId,
      message: 'Failed to delete Google Calendar event'
    });

    throw new Error('Failed to delete Google Calendar event');
  }
};

export default deleteGoogleCalendarEvent;
