import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { TimeSeriesData } from '@util/constants.gql';

/**
 * Returns the event attendees series over the last month.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 *
 * @example
 * // Returns [
 * // { name: '2021-01-16T00:00:00Z', value: 100 },
 * // { name: '2021-01-17T00:00:00Z', value: 150 },
 * // { name: '2021-01-18T00:00:00Z', value: 200 },
 * // ]
 * getEventAttendeesSeries()
 */
const getEventAttendeesSeries = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<TimeSeriesData[]> => {
  const { communityId } = ctx;

  const cacheKey = `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${communityId}`;

  if (EventAttendee.cache.has(cacheKey)) {
    return EventAttendee.cache.get(cacheKey);
  }

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
