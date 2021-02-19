import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import addGoogleCalendarEventAttendee from '@integrations/google/repo/addGoogleCalendarEventAttendee';
import Event from '../event/Event';
import EventGuest from './EventGuest';

export default class EventGuestSubscriber
  implements EventSubscriber<EventGuest> {
  getSubscribedEntities(): EntityName<EventGuest>[] {
    return [EventGuest];
  }

  async afterCreate({ entity }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${entity.event.id}`
    ]);

    const bm = new BloomManager();

    const [event] = await Promise.all([
      bm.findOne(Event, { id: entity.event.id })
    ]);

    if (!event.googleCalendarEventId) return;

    await addGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      displayName: `${entity.firstName} ${entity.lastName}`,
      email: entity.email,
      responseStatus: 'accepted'
    });
  }

  async afterDelete({ entity }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${entity.event.id}`
    ]);
  }
}
