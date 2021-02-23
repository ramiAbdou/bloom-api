import { calendar_v3 } from 'googleapis';

import { GoogleEvent } from '@util/events';
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
  if (!eventId) return null;

  // Need to fetch all of the previous event attendees first to append
  // the new attendee to.
  const { data: event } = await eventsCalendar.events.get({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
    fields: 'attendees'
  });

  const previousAttendees = event.attendees ?? [];

  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: { attendees: [...previousAttendees, attendee] }
    });

    logger.log({
      event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE,
      level: 'INFO'
    });

    return response.data;
  } catch (e) {
    logger.log({
      error: e,
      event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE,
      level: 'ERROR'
    });

    throw new Error(`Couldn't add attendee to Google Calendar event.`);
  }
};

export default addGoogleCalendarEventAttendee;
