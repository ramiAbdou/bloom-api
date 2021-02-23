import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import deleteGoogleCalendarEventAttendee from '@integrations/google/repo/deleteGoogleCalendarEventAttendee';
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import EventGuest from './EventGuest';

export default class EventGuestSubscriber
  implements EventSubscriber<EventGuest> {
  getSubscribedEntities(): EntityName<EventGuest>[] {
    return [EventGuest];
  }

  async afterDelete({ entity: guest }: EventArgs<EventGuest>) {
    cache.invalidateKeys([`${QueryEvent.GET_EVENT_GUESTS}-${guest.event.id}`]);

    const bm = new BloomManager();
    const event = await bm.findOne(Event, { id: guest.event.id });

    await deleteGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      email: guest.email
    });
  }
}
