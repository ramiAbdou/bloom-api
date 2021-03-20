import { calendar_v3 } from 'googleapis';

import logger from '@system/logger/logger';
import { GoogleEvent } from '@util/constants.events';
import { eventsCalendar } from '../Google.util';

/**
 * Returns the updated Google Calendar event after removing the attendee.
 *
 * @param eventId ID of the event.
 * @param attendee.email Email of the user.
 */
const deleteGoogleCalendarEventAttendee = async (
  eventId: string,
  attendee: calendar_v3.Schema$EventAttendee
): Promise<calendar_v3.Schema$Event> => {
  if (!eventId) return null;

  // Need to fetch all of the previous event attendees first to append
  // the new attendee to.
  const { data: event } = await eventsCalendar.events.get({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
    fields: 'attendees'
  });

  const filteredAttendees = event.attendees.filter(
    (element: calendar_v3.Schema$EventAttendee) => {
      return element.email !== attendee.email;
    }
  );

  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: { attendees: filteredAttendees }
    });

    logger.log({
      event: GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE,
      level: 'INFO'
    });

    return response.data;
  } catch (e) {
    logger.log({
      error: e,
      event: GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE,
      level: 'ERROR'
    });

    throw new Error(`Couldn't remove attendee from Google Calendar event.`);
  }
};

export default deleteGoogleCalendarEventAttendee;
