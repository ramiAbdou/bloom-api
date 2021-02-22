import day from 'dayjs';
import {
  EntityName,
  EventArgs,
  EventSubscriber as ESubscriber
} from '@mikro-orm/core';

import cache from '@core/db/cache';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import { QueryEvent } from '@util/events';
import Event, { EventPrivacy } from './Event';

export default class EventSubscriber implements ESubscriber<Event> {
  getSubscribedEntities(): EntityName<Event>[] {
    return [Event];
  }

  async afterUpdate({ entity }: EventArgs<Event>) {
    if (entity.deletedAt && entity.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(entity.googleCalendarEventId);
    }

    if (entity.googleCalendarEventId) {
      await updateGoogleCalendarEvent(entity.googleCalendarEventId, {
        description: entity.description,
        summary: entity.title,
        visibility:
          entity.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
      });

      return;
    }

    cache.invalidateKeys([
      `${QueryEvent.GET_EVENT}-${entity.id}`,
      ...(day().isAfter(day(entity.endTime))
        ? [`${QueryEvent.GET_PAST_EVENTS}-${entity.community.id}`]
        : [`${QueryEvent.GET_UPCOMING_EVENTS}-${entity.community.id}`])
    ]);
  }
}
