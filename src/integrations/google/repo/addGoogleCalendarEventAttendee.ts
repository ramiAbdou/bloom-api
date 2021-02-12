import { calendar_v3 } from 'googleapis';

import logger from '@util/logger';
import { eventsCalendar } from '../Google.util';

/**
 * Adds attendee to the Google Calendar event.
 *
 * @param eventId ID of the event.
 * @param attendee.displayName Full name of the user.
 * @param attendee.email Email of the user.
 * @param attendee.responseStatus 'accepted'.
 */
const addGoogleCalendarEventAttendee = async (
  eventId: string,
  attendee: calendar_v3.Schema$EventAttendee
) => {
  const { data: event } = await eventsCalendar.events.get({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
    fields: 'attendees'
  });

  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: {
        attendees: event.attendees ? [...event.attendees, attendee] : [attendee]
      }
    });

    logger.log({ event: 'ADD_GOOGLE_CALENDAR_EVENT_ATTENDEE', level: 'INFO' });
    return response.data;
  } catch (e) {
    logger.log({
      error: e,
      event: 'ADD_GOOGLE_CALENDAR_EVENT_ATTENDEE',
      level: 'ERROR'
    });

    throw new Error(`Couldn't add attendee to Google Calendar event.`);
  }
};

export default addGoogleCalendarEventAttendee;
