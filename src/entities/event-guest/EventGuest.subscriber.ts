import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import EventGuest from './EventGuest';

@Subscriber()
export default class EventGuestSubscriber
  implements EventSubscriber<EventGuest> {
  async afterCreate({ entity }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${entity.event.id}`
    ]);
  }

  async afterDelete({ entity }: EventArgs<EventGuest>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_GUESTS}-${entity.event.id}`
    ]);
  }
}
