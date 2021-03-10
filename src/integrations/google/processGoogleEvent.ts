import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import Event, { EventPrivacy } from '@entities/event/Event';
import updateGoogleCalendarEventId from '@entities/event/repo/updateGoogleCalendarEventId';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import deleteGoogleCalendarEventAttendee from '@integrations/google/repo/deleteGoogleCalendarEventAttendee';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import { GoogleEvent } from '@util/events';
import addGoogleCalendarEventAttendee from './repo/addGoogleCalendarEventAttendee';
import createGoogleCalendarEvent from './repo/createGoogleCalendarEvent';

export interface GoogleEventArgs {
  eventId: string;
  guestId?: string;
  googleEvent: GoogleEvent;
}

/**
 * Processes the GoogleEvent properly.
 *
 * @param args.eventId - ID of the Event.
 * @param args.guestId - ID of the EventGuest.
 * @param args.googleEvent - Internal Google Event.
 */
const processGoogleEvent = async (args: GoogleEventArgs) => {
  const { eventId, guestId, googleEvent } = args;

  const bm = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.findOne(Event, { id: eventId }, { filters: false }),
    bm.findOne(
      EventGuest,
      { id: guestId },
      { filters: false, populate: ['member', 'supporter'] }
    )
  ]);

  if (
    googleEvent === GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE &&
    event &&
    guest
  ) {
    await addGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      displayName: guest?.member?.fullName ?? guest?.supporter?.fullName,
      email: guest?.member?.email ?? guest?.supporter?.email,
      responseStatus: 'accepted'
    });

    return;
  }

  if (googleEvent === GoogleEvent.CREATE_CALENDAR_EVENT) {
    await bm.em.populate(event, ['community']);

    const googleCalendarEvent = await createGoogleCalendarEvent({
      description: event.description,
      end: { dateTime: event.endTime },
      location: await event.eventUrl(),
      start: { dateTime: event.startTime },
      summary: event.title,
      visibility:
        event.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
    });

    await updateGoogleCalendarEventId({
      eventId: event.id,
      googleCalendarEventId: googleCalendarEvent.id
    });
  }

  if (googleEvent === GoogleEvent.DELETE_CALENDAR_EVENT) {
    await deleteGoogleCalendarEvent(event.googleCalendarEventId);
  }

  if (googleEvent === GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE) {
    await deleteGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      email: guest?.member?.email ?? guest?.supporter?.email
    });
  }

  if (googleEvent === GoogleEvent.UPDATE_CALENDAR_EVENT) {
    await updateGoogleCalendarEvent(event.googleCalendarEventId, {
      description: event.description,
      summary: event.title,
      visibility:
        event.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
    });
  }
};

export default processGoogleEvent;
