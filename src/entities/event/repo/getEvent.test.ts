/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import { APP } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { buildEvent, initDatabaseIntegrationTest } from '@util/test.util';
import getEvent from './getEvent';

describe(`getEvent()`, () => {
  initDatabaseIntegrationTest();

  test('Should add Event to cache after query.', async () => {
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;
    const cacheKey: string = `${QueryEvent.GET_EVENT}-${eventId}`;
    const actualResult: Event = await getEvent({ eventId });
    expect(actualResult).toEqual(Event.cache.get(cacheKey));
  });

  test('Should use args.eventId to query the Event.', async () => {
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;
    const cacheKey: string = `${QueryEvent.GET_EVENT}-${eventId}`;

    const spyFindOne = jest.spyOn(BloomManager.prototype, 'findOne');
    const actualResult: Event = await getEvent({ eventId });
    const whereArg = spyFindOne.mock.calls[0][1];

    expect(whereArg).toEqual(eventId);
    expect(actualResult).toEqual(Event.cache.get(cacheKey));
  });

  test('Event URL should be constructed from community URL name.', async () => {
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;
    const actualResult: Event = await getEvent({ eventId });

    expect(await actualResult.eventUrl()).toBe(
      `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`
    );
  });
});
