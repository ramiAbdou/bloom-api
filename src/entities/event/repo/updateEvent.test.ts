/**
 * @group integration
 */

import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import * as emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { GoogleEvent, QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  eventFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import Event, { EventPrivacy } from '../Event';
import listUpcomingEvents from './listUpcomingEvents';
import updateEvent, { UpdateEventArgs } from './updateEvent';

describe('updateEvent()', () => {
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

  test('Should update the Event with the updated data.', async () => {
    const updateArgs: UpdateEventArgs = {
      description: faker.random.words(10),
      eventId: event.id,
      imageUrl: faker.internet.url(),
      privacy: EventPrivacy.OPEN_TO_ALL,
      summary: faker.random.words(5),
      title: faker.random.word(),
      videoUrl: faker.internet.url()
    };

    jest.spyOn(emitGoogleEvent, 'default').mockImplementation();
    const updatedEvent: Event = await updateEvent(updateArgs);

    expect(updatedEvent)
      .toHaveProperty('description', updateArgs.description)
      .toHaveProperty('id', updateArgs.eventId)
      .toHaveProperty('imageUrl', updateArgs.imageUrl)
      .toHaveProperty('privacy', updateArgs.privacy)
      .toHaveProperty('summary', updateArgs.summary)
      .toHaveProperty('title', updateArgs.title)
      .toHaveProperty('videoUrl', updateArgs.videoUrl);
  });

  test('Should emit a GoogleEvent.UPDATE_CALENDAR_EVENT event.', async () => {
    const spyEmitGoogleEvent = jest
      .spyOn(emitGoogleEvent, 'default')
      .mockImplementation();

    await updateEvent({ eventId });

    expect(spyEmitGoogleEvent)
      .toBeCalledTimes(1)
      .toBeCalledWith(GoogleEvent.UPDATE_CALENDAR_EVENT, { eventId });
  });

  test('Should invalidate QueryEvent.GET_EVENT in Event cache.', async () => {
    jest.spyOn(emitGoogleEvent, 'default').mockImplementation();
    await updateEvent({ eventId });
    expect(Event.cache.has(cacheKey)).toBe(false);
  });

  test('Should invalidate QueryEvent.GET_UPCOMING_EVENTS in Event cache.', async () => {
    const communityId: string = event.community.id;
    cacheKey = `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`;
    jest.spyOn(emitGoogleEvent, 'default').mockImplementation();

    await listUpcomingEvents({ communityId });
    expect(Event.cache.has(cacheKey)).toBe(true);
    await updateEvent({ eventId, imageUrl: faker.internet.url() });
    expect(Event.cache.has(cacheKey)).toBe(false);
  });
});
