import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import addGoogleCalendarEventAttendee from '@integrations/google/repo/addGoogleCalendarEventAttendee';
import deleteGoogleCalendarEventAttendee from '@integrations/google/repo/deleteGoogleCalendarEventAttendee';
import Event from '../event/Event';
import EventGuest from './EventGuest';

export default class EventGuestSubscriber
  implements EventSubscriber<EventGuest> {
  getSubscribedEntities(): EntityName<EventGuest>[] {
    return [EventGuest];
  }

  async afterCreate({ entity: guest }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${guest.event.id}`
    ]);

    await addGoogleCalendarEventAttendee(guest.event.googleCalendarEventId, {
      displayName: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      responseStatus: 'accepted'
    });
  }

  async afterDelete({ entity: guest }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${guest.event.id}`
    ]);

    const bm = new BloomManager();
    const event = await bm.findOne(Event, { id: guest.event.id });

    await deleteGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      email: guest.email
    });
  }
}
