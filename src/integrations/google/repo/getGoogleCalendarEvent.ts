import { calendar_v3 as calendarV3 } from 'googleapis';

import { eventsCalendar } from '../Google.util';

/**
 * Returns the Google Calendar event.
 *
 * @param googleCalendarEventId - ID of the Google Calendar event.
 */
const getGoogleCalendarEvent = async (
  googleCalendarEventId: string
): Promise<calendarV3.Schema$Event> => {
  if (!googleCalendarEventId) return null;

  const response = await eventsCalendar.events.get({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: googleCalendarEventId
  });

  return response.data;
};

export default getGoogleCalendarEvent;
