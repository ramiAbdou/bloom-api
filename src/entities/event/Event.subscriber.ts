import day from 'dayjs';
import {
  EntityName,
  EventArgs,
  EventSubscriber as ESubscriber
} from '@mikro-orm/core';

import cache from '@core/db/cache';
import createGoogleCalendarEvent from '@integrations/google/repo/createGoogleCalendarEvent';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import { QueryEvent } from '@util/events';
import Event from './Event';
import updateEvent from './repo/updateEvent';

export default class EventSubscriber implements ESubscriber<Event> {
  getSubscribedEntities(): EntityName<Event>[] {
    return [Event];
  }

  async afterCreate({ entity }: EventArgs<Event>) {
    cache.invalidateKeys([
      `${QueryEvent.GET_UPCOMING_EVENTS}-${entity.community.id}`
    ]);

    // send Email

    const googleCalendarEvent = await createGoogleCalendarEvent({
      description: entity.description,
      end: { dateTime: entity.endTime },
      location: await entity.eventUrl(),
      start: { dateTime: entity.startTime },
      summary: entity.title,
      visibility: entity.private ? 'private' : 'public'
    });

    await updateEvent({
      googleCalendarEventId: googleCalendarEvent.id,
      id: entity.id
    });
  }

  async afterUpdate({ entity }: EventArgs<Event>) {
    if (entity.deletedAt && entity.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(entity.googleCalendarEventId);
    }

    if (entity.googleCalendarEventId) {
      await updateGoogleCalendarEvent(entity.googleCalendarEventId, {
        description: entity.description,
        summary: entity.title,
        visibility: entity.private ? 'private' : 'public'
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
