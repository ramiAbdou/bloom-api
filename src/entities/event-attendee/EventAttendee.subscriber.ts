import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import EventAttendee from './EventAttendee';

export default class EventAttendeeSubscriber
  implements EventSubscriber<EventAttendee> {
  getSubscribedEntities(): EntityName<EventAttendee>[] {
    return [EventAttendee];
  }

  async afterCreate({ entity }: EventArgs<EventAttendee>) {
    // `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${communityId}`

    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT_ATTENDEES}-${entity.event.id}`
    ]);
  }
}
