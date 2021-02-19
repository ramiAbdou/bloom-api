import { calendar_v3 } from 'googleapis';

import { MiscEvent } from '@util/events';
import logger from '@util/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Creates the Google Calendar event on the events calendar.
 *
 * @param eventId ID of the event.
 * @param args.description Description of the event.
 * @param args.summary Summary time of the event.
 * @param args.visibility Visibility of the event (public or private).
 */
const updateGoogleCalendarEvent = async (
  eventId: string,
  args: Pick<calendar_v3.Schema$Event, 'description' | 'summary' | 'visibility'>
): Promise<calendar_v3.Schema$Event> => {
  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: args
    });

    logger.log({
      event: MiscEvent.UPDATE_GOOGLE_CALENDAR_EVENT,
      level: 'INFO'
    });

    return response.data;
  } catch (e) {
    logger.log({
      error: e,
      event: MiscEvent.UPDATE_GOOGLE_CALENDAR_EVENT,
      level: 'ERROR'
    });

    throw new Error('There was an issue updating the Google Calendar event.');
  }
};

export default updateGoogleCalendarEvent;
