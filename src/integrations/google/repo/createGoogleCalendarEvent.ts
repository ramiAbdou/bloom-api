import { calendar_v3 as calendarV3 } from 'googleapis';

import logger from '@system/logger';
import { GoogleEvent } from '@util/constants.events';
import { eventsCalendar } from '../Google.util';

/**
 * Returns the new Google Calendar event.
 *
 * @param args.description - Description of the Google Calendar event.
 * @param args.end - End time of the Google Calendar event.
 * @param args.location - Bloom URL of the Google Calendar event.
 * @param args.start - Start time of the Google Calendar event.
 * @param args.summary - Title of the Google Calendar event.
 * @param args.visibility - Visibility of the Google Calendar event.
 */
const createGoogleCalendarEvent = async (
  args: Pick<
    calendarV3.Schema$Event,
    'description' | 'end' | 'location' | 'start' | 'summary' | 'visibility'
  >
): Promise<calendarV3.Schema$Event> => {
  try {
    const response = await eventsCalendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: args
    });

    logger.info({
      event: GoogleEvent.CREATE_CALENDAR_EVENT,
      googleCalendarEventId: response.data.id,
      message: 'Created Google Calendar event.'
    });

    return response.data;
  } catch (error) {
    logger.error({
      error,
      event: GoogleEvent.CREATE_CALENDAR_EVENT,
      googleCalendarEvent: args,
      message: 'Failed to create Google Calendar event.'
    });

    throw new Error('Failed to create Google Calendar event.');
  }
};

export default createGoogleCalendarEvent;
