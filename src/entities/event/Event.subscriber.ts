import day from 'dayjs';
import {
  EventArgs,
  EventSubscriber as ESubscriber,
  Subscriber
} from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import Event from './Event';

@Subscriber()
export default class EventSubscriber implements ESubscriber<Event> {
  async afterCreate({ entity }: EventArgs<Event>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_UPCOMING_EVENTS}-${entity.community.id}`
    ]);
  }

  async afterUpdate({ entity }: EventArgs<Event>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_EVENT}-${entity.id}`,
      ...(day().isAfter(day(entity.endTime))
        ? [`${QueryEvent.GET_PAST_EVENTS}-${entity.community.id}`]
        : [`${QueryEvent.GET_UPCOMING_EVENTS}-${entity.community.id}`])
    ]);
  }
}
