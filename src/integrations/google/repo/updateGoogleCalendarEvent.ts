import { calendar_v3 as calendarV3 } from 'googleapis';

import logger from '@system/logger';
import { GoogleEvent } from '@util/constants.events';
import { eventsCalendar } from '../Google.util';

/**
 * Returns the updated Google Calendar event.
 *
 * @param eventId - ID of the event.
 * @param args.description - Description of the event.
 * @param args.summary - Summary time of the event.
 * @param args.visibility - Visibility of the event (public or private).
 */
const updateGoogleCalendarEvent = async (
  eventId: string,
  args: Pick<calendarV3.Schema$Event, 'description' | 'summary' | 'visibility'>
): Promise<calendarV3.Schema$Event> => {
  if (!eventId) return null;

  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: args
    });

    logger.info({
      event: GoogleEvent.UPDATE_CALENDAR_EVENT,
      googleCalendarEventId: eventId,
      message: 'Updated Google Calendar event.'
    });

    return response.data;
  } catch (error) {
    logger.error({
      error,
      event: GoogleEvent.UPDATE_CALENDAR_EVENT,
      googleCalendarEventId: eventId,
      message: 'Failed to update Google Calendar event.'
    });

    throw new Error('Failed to update Google Calendar event.');
  }
};

export default updateGoogleCalendarEvent;
