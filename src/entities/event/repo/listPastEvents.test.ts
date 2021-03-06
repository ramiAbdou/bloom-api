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
import listPastEvents from './listPastEvents';

describe(`listPastEvents()`, () => {
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
      cacheKey = `${QueryEvent.LIST_PAST_EVENTS}-${communityId}`;
    }
  });

  test('Should add the past Event(s) to cache after query.', async () => {
    const queriedEvents: Event[] = await listPastEvents({ communityId });
    expect(Event.cache.get(cacheKey)).toEqual(queriedEvents);
  });

  test('Should all be events in the past.', async () => {
    const queriedEvents: Event[] = await listPastEvents({ communityId });

    expect(queriedEvents.length).toBeGreaterThan(0);
    queriedEvents.forEach((event) => expect(event.endTime < now()).toBe(true));
  });
});
