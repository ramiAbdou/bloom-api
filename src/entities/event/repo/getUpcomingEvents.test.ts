/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  eventFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import { now } from '@util/util';
import getUpcomingEvents from './getUpcomingEvents';

describe(`getUpcomingEvents()`, () => {
  let communityId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();
      const community = bm.create(Community, communityFactory.build());

      eventFactory
        .buildList(6)
        .map((data) => bm.create(Event, { ...data, community }));

      await bm.flush();

      communityId = community.id;
      cacheKey = `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`;
    }
  });

  test('Should add the upcoming Event(s) to cache after query.', async () => {
    const queriedEvents: Event[] = await getUpcomingEvents({ communityId });
    expect(Event.cache.get(cacheKey)).toEqual(queriedEvents);
  });

  test('Should all be events that are upcoming.', async () => {
    const queriedEvents: Event[] = await getUpcomingEvents({ communityId });

    expect(queriedEvents.length).toBeGreaterThan(0);

    queriedEvents.forEach((event) =>
      expect(event.startTime > now()).toBe(true)
    );
  });
});
