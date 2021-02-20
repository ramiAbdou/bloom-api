import day from 'dayjs';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import { QueryEvent } from '@util/events';
import { TimeSeriesData } from '@util/gql';

/**
 * Returns the event attendees series over the last month.
 *
 * @example getEventAttendeesSeries() => [
 *  { name: '2021-01-16T00:00:00Z', value: 100 },
 *  { name: '2021-01-17T00:00:00Z', value: 150 },
 *  { name: '2021-01-18T00:00:00Z', value: 200 },
 * ]
 */
const getEventAttendeesSeries = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<TimeSeriesData[]> => {
  const cacheKey = `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const attendees: EventAttendee[] = await new BloomManager().find(
    EventAttendee,
    {
      createdAt: { $gt: day.utc().subtract(30, 'd').format() },
      event: { community: { id: communityId } }
    }
  );

  const endOfToday = day.utc().endOf('day');

  // [0, 1, 2, 3, 4, 5...]
  const indexKeys = Array.from(Array(30).keys());

  // Build an array of member count over the last 90 days.
  const result: TimeSeriesData[] = indexKeys.map((i: number) => {
    // The name key is the stringified datetime.
    const dateKey = endOfToday.subtract(30 - i - 1, 'd').format();

    const filteredAttendees: EventAttendee[] = attendees.filter(
      ({ createdAt }) => createdAt < dateKey
    );

    return { name: dateKey, value: filteredAttendees?.length };
  });

  return result;
};

export default getEventAttendeesSeries;
