import { calendar_v3 } from 'googleapis';

import { eventsCalendar } from '../Google.util';

const getGoogleCalendarEvent = async (
  googleCalendarEventId: string
): Promise<calendar_v3.Schema$Event> => {
  if (!googleCalendarEventId) return null;

  const response = await eventsCalendar.events.get({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: googleCalendarEventId
  });

  return response.data;
};

export default getGoogleCalendarEvent;
