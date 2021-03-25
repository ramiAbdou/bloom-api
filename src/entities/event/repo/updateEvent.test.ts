/**
 * @group integration
 */

import faker from 'faker';

import Community from '@entities/community/Community';
import * as emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { GoogleEvent, QueryEvent } from '@util/constants.events';
import { buildEvent, initDatabaseIntegrationTest } from '@util/test.util';
import Event, { EventPrivacy } from '../Event';
import getUpcomingEvents from './getUpcomingEvents';
import updateEvent, { UpdateEventArgs } from './updateEvent';

describe('updateEvent()', () => {
  initDatabaseIntegrationTest([Community, Event]);

  test('Should update the Event with the updated data.', async () => {
    const event: Event = (await buildEvent()) as Event;

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
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;

    const spyEmitGoogleEvent = jest
      .spyOn(emitGoogleEvent, 'default')
      .mockImplementation();

    await updateEvent({ eventId });

    expect(spyEmitGoogleEvent)
      .toBeCalledTimes(1)
      .toBeCalledWith(GoogleEvent.UPDATE_CALENDAR_EVENT, { eventId });
  });

  test('Should invalidate QueryEvent.GET_EVENT in Event cache.', async () => {
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;
    const cacheKey: string = `${QueryEvent.GET_EVENT}-${eventId}`;

    jest.spyOn(emitGoogleEvent, 'default').mockImplementation();

    await updateEvent({ eventId });

    expect(Event.cache.has(cacheKey)).toBe(false);
  });

  test('Should invalidate QueryEvent.GET_UPCOMING_EVENTS in Event cache.', async () => {
    const event: Event = (await buildEvent()) as Event;
    const eventId: string = event.id;
    const communityId: string = event.community.id;
    const cacheKey: string = `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`;
    jest.spyOn(emitGoogleEvent, 'default').mockImplementation();

    await getUpcomingEvents({ communityId });
    expect(Event.cache.has(cacheKey)).toBe(true);
    await updateEvent({ eventId, imageUrl: faker.internet.url() });
    expect(Event.cache.has(cacheKey)).toBe(false);
  });
});
