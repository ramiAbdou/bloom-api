import { calendar_v3 as calendarV3 } from 'googleapis';

import logger from '@system/logger';
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

  const filteredAttendees = event.attendees.filter(
    (element: calendarV3.Schema$EventAttendee) => {
      return element.email !== attendee.email;
    }
  );

  try {
    const response = await eventsCalendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: { attendees: filteredAttendees }
    });

    logger.info({
      event: GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE,
      googleCalendarEventId: eventId,
      message: 'Removed attendee from Google Calendar event.'
    });

    return response.data;
  } catch (error) {
    logger.error({
      error,
      event: GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE,
      message: 'Failed to remove attendee from Google Calendar event.'
    });

    throw new Error('Failed to remove attendee from Google Calendar event.');
  }
};

export default deleteGoogleCalendarEventAttendee;
