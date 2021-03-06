import { calendar_v3 as calendarV3 } from 'googleapis';

import logger from '@system/logger';
import { GoogleEvent } from '@util/constants.events';
import { eventsCalendar } from '../Google.util';

/**
 * Returns the updated Google Calendar event after adding an attendee to it.
 *
 * @param eventId - ID of the event.
 * @param attendee.displayName - Full name of the user.
 * @param attendee.email - Email of the user.
 * @param attendee.responseStatus - 'accepted'.
 */
const addGoogleCalendarEventAttendee = async (
  eventId: string,
  attendee: calendarV3.Schema$EventAttendee
): Promise<calendarV3.Schema$Event> => {
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

    logger.info({
      attendee,
      event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE,
      googleCalendarEventId: eventId,
      message: 'Added attendee to Google Calendar event.'
    });

    return response.data;
  } catch (e) {
    logger.error({
      attendee,
      error: e,
      event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE,
      googleCalendarEventId: eventId,
      message: 'Failed to add attendee to Google Calendar event.'
    });

    throw new Error(`Couldn't add attendee to Google Calendar event.`);
  }
};

export default addGoogleCalendarEventAttendee;
