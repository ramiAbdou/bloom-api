import { calendar_v3 } from 'googleapis';

import { GoogleEvent } from '@util/events';
import logger from '@system/logger/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Creates the Google Calendar event on the events calendar.
 *
 * @param args.description Description of the event.
 * @param args.end End time of the event.
 * @param args.location Bloom URL of the event.
 * @param args.start Start time of the event.
 * @param args.summary Title of the event.
 * @param args.visibility Visibility of the event (public or private).
 */
const createGoogleCalendarEvent = async (
  args: Pick<
    calendar_v3.Schema$Event,
    'description' | 'end' | 'location' | 'start' | 'summary' | 'visibility'
  >
): Promise<calendar_v3.Schema$Event> => {
  try {
    const response = await eventsCalendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: args
    });

    logger.log({
      event: GoogleEvent.CREATE_CALENDAR_EVENT,
      level: 'INFO'
    });

    return response.data;
  } catch (e) {
    logger.log({
      error: e,
      event: GoogleEvent.CREATE_CALENDAR_EVENT,
      level: 'ERROR'
    });

    throw new Error('There was an issue creating the Google Calendar event.');
  }
};

export default createGoogleCalendarEvent;
