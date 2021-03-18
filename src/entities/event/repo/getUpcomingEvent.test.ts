import day from 'dayjs';
import faker from 'faker';

import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import { QueryEvent } from '@util/constants.events';
import { buildEvent, initDatabaseIntegrationTest } from '@util/test.util';
import { now } from '@util/util';
import getUpcomingEvents from './getUpcomingEvents';

describe(`getUpcomingEvents()`, () => {
  initDatabaseIntegrationTest([Community, Event]);

  test('Should add the upcoming Event(s) to cache after query.', async () => {
    const events: Event[] = await buildEvent({ count: 6 });
    const communityId: string = events[0].community.id;
    const cacheKey: string = `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`;
    const queriedEvents: Event[] = await getUpcomingEvents({ communityId });
    expect(Event.cache.get(cacheKey)).toEqual(queriedEvents);
  });

  test('Should all be events that are upcoming.', async () => {
    const count = 6;

    const events: Event[] = await buildEvent({
      buildOverrides: (i: number) => {
        const subtractHour: number = faker.random.number(25);
        const endTimeDayObject = day.utc().subtract(subtractHour, 'hour');
        const startTimeDayObject = day.utc().subtract(subtractHour - 1, 'hour');

        return i % 2 === 0
          ? {
              endTime: endTimeDayObject.format(),
              startTime: startTimeDayObject.format()
            }
          : {};
      },
      count
    });

    const communityId: string = events[0].community.id;
    const queriedEvents: Event[] = await getUpcomingEvents({ communityId });

    expect(queriedEvents.length).toBe(count / 2);

    queriedEvents.forEach((event) =>
      expect(event.startTime > now()).toBe(true)
    );
  });
});
