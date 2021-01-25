import day from 'dayjs';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import { TimeSeriesData } from '@util/gql.types';
import EventAttendee from '../../event-attendee/EventAttendee';
import Event from '../Event';

const getEventAttendeesSeries = async (eventId: string) => {
  const cacheKey = `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${eventId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const event: Event = await bm.findOne(
    Event,
    { id: eventId },
    { populate: ['attendees'] }
  );

  const timeSeriesKeys: string[] = [];

  let currentTime: string = day
    .utc(event.startTime)
    .subtract(5, 'minute')
    .format();

  while (currentTime <= day.utc(event.endTime).add(5, 'minute').format()) {
    timeSeriesKeys.push(currentTime);
    currentTime = day.utc(currentTime).add(5, 'minute').format();
  }

  const attendees: EventAttendee[] = event.attendees.getItems();

  const result: TimeSeriesData[] = timeSeriesKeys.reduce(
    (acc: TimeSeriesData[], dateKey: string) => {
      const numAttendees = attendees.filter((attendee: EventAttendee) => {
        return attendee.createdAt <= dateKey;
      })?.length;

      return [...acc, { name: dateKey, value: numAttendees }];
    },
    []
  );

  cache.set(cacheKey, result);

  return result;
};

export default getEventAttendeesSeries;
