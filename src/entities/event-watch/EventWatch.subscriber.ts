import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import EventWatch from './EventWatch';

export default class EventWatchSubscriber
  implements EventSubscriber<EventWatch> {
  getSubscribedEntities(): EntityName<EventWatch>[] {
    return [EventWatch];
  }

  async afterCreate({ entity }: EventArgs<EventWatch>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_WATCHES}-${entity.event.id}`
    ]);
  }
}
