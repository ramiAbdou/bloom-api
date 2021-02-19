import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import EventAttendee from './EventAttendee';

export default class EventAttendeeSubscriber
  implements EventSubscriber<EventAttendee> {
  getSubscribedEntities(): EntityName<EventAttendee>[] {
    return [EventAttendee];
  }

  async afterCreate({ entity }: EventArgs<EventAttendee>) {
    // `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${communityId}`

    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_ATTENDEES}-${entity.event.id}`
    ]);
  }
}
