/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import { APP } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  eventFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import Community from '../../community/Community';
import getEvent from './getEvent';

describe(`getEvent()`, () => {
  let event: Event;
  let eventId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      event = await bm.createAndFlush(Event, {
        ...eventFactory.build(),
        community: bm.create(Community, communityFactory.build())
      });

      eventId = event.id;
      cacheKey = `${QueryEvent.GET_EVENT}-${eventId}`;
    }
  });

  test('Should add Event to cache after query.', async () => {
    const actualResult: Event = await getEvent({ eventId });
    expect(actualResult).toEqual(Event.cache.get(cacheKey));
  });

  test('Should use args.eventId to query the Event.', async () => {
    const spyFindOne = jest.spyOn(BloomManager.prototype, 'findOne');
    const actualResult: Event = await getEvent({ eventId });
    const whereArg = spyFindOne.mock.calls[0][1];

    expect(whereArg).toEqual(eventId);
    expect(actualResult).toEqual(Event.cache.get(cacheKey));
  });

  test('Event URL should be constructed from community URL name.', async () => {
    const actualResult: Event = await getEvent({ eventId });

    expect(await actualResult.eventUrl()).toBe(
      `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`
    );
  });
});
