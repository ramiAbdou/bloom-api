import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import EventWatch from './EventWatch';

@Subscriber()
export default class EventWatchSubscriber
  implements EventSubscriber<EventWatch> {
  async afterCreate({ entity }: EventArgs<EventWatch>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_WATCHES}-${entity.event.id}`
    ]);
  }
}
