import day from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import { TimeSeriesData } from '@util/gql.types';
import EventGuest from '../../event-guest/EventGuest';
import Event from '../Event';

@ArgsType()
export class GetGuestSeries {
  @Field()
  eventId: string;
}

const getEventGuestSeries = async ({
  eventId
}: GetGuestSeries): Promise<TimeSeriesData[]> => {
  const cacheKey = `${QueryEvent.GET_EVENT_GUEST_SERIES}-${eventId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const event: Event = await bm.findOne(
    Event,
    { id: eventId },
    { populate: ['guests'] }
  );

  const timeSeriesKeys: string[] = [];

  let currentTime: string = day.utc(event.startTime).format();

  while (currentTime >= day.utc(event.createdAt).subtract(1, 'hour').format()) {
    timeSeriesKeys.push(currentTime);

    currentTime = day
      .utc(currentTime)
      .subtract(1, 'hour')
      .startOf('hour')
      .format();
  }

  const guests: EventGuest[] = event.guests.getItems();

  const result: TimeSeriesData[] = timeSeriesKeys
    .reverse()
    .reduce((acc: TimeSeriesData[], dateKey: string) => {
      if (day.utc().isBefore(day.utc(dateKey))) {
        return [...acc, { name: dateKey, value: null }];
      }

      const numGuests = guests.filter((guest: EventGuest) => {
        return guest.createdAt <= dateKey;
      })?.length;

      return [...acc, { name: dateKey, value: numGuests }];
    }, []);

  cache.set(cacheKey, result);

  return result;
};

export default getEventGuestSeries;
