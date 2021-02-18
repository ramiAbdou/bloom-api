import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import EventAttendee from './EventAttendee';

@Subscriber()
export default class EventAttendeeSubscriber
  implements EventSubscriber<EventAttendee> {
  async afterCreate({ entity }: EventArgs<EventAttendee>) {
    // `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${communityId}`

    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT_ATTENDEES}-${entity.event.id}`
    ]);
  }
}
