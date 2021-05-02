import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import Event, { EventPrivacy } from '@entities/event/Event';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import deleteGoogleCalendarEventAttendee from '@integrations/google/repo/deleteGoogleCalendarEventAttendee';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import { GoogleEvent } from '@util/constants.events';
import addGoogleCalendarEventAttendee from './repo/addGoogleCalendarEventAttendee';
import createGoogleCalendarEvent from './repo/createGoogleCalendarEvent';

export type GoogleEventArgs =
  | {
      event: GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE;
      payload: { eventId: string; guestId: string };
    }
  | {
      event: GoogleEvent.CREATE_CALENDAR_EVENT;
      payload: { eventId: string };
    }
  | {
      event: GoogleEvent.DELETE_CALENDAR_EVENT;
      payload: { eventId: string };
    }
  | {
      event: GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE;
      payload: { eventId: string; guestId: string };
    }
  | {
      event: GoogleEvent.UPDATE_CALENDAR_EVENT;
      payload: { eventId: string };
    };

/**
 * Processes the GoogleEvent properly.
 *
 * @param args.eventId - ID of the Event.
 * @param args.guestId - ID of the EventGuest.
 * @param args.event - Internal Google Event.
 */
const processGoogleEvent = async ({
  payload,
  event: googleEvent
}: GoogleEventArgs): Promise<void> => {
  const { eventId } = payload;

  const bm: BloomManager = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.em.findOne(Event, { id: eventId }, { filters: false }),
    bm.em.findOne(
      EventGuest,
      { id: '' },
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

    await createGoogleCalendarEvent({
      description: event.description,
      end: { dateTime: event.endTime },
      location: await event.eventUrl(),
      start: { dateTime: event.startTime },
      summary: event.title,
      visibility:
        event.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
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
