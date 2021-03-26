/**
 * @group integration
 */

import day from 'dayjs';
import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  eventFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import Event from '../Event';
import getPastEvents from './getPastEvents';
import updateRecordingUrl, {
  UpdateRecordingUrlArgs
} from './updateRecordingUrl';

describe('updateRecordingUrl()', () => {
  let event: Event;
  let eventId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      event = await bm.createAndFlush(Event, {
        ...eventFactory.build({
          endTime: day.utc().subtract(1, 'day').format(),
          startTime: day.utc().subtract(1, 'day').format()
        }),
        community: bm.create(Community, communityFactory.build())
      });

      eventId = event.id;
      cacheKey = `${QueryEvent.GET_EVENT}-${eventId}`;
    }
  });

  test('Should update the Event with the recordingUrl.', async () => {
    const updateArgs: UpdateRecordingUrlArgs = {
      eventId: event.id,
      recordingUrl: faker.internet.url()
    };

    const updatedEvent: Event = await updateRecordingUrl(updateArgs);

    expect(updatedEvent)
      .toHaveProperty('id', updateArgs.eventId)
      .toHaveProperty('recordingUrl', updateArgs.recordingUrl);
  });

  test('Should invalidate QueryEvent.GET_EVENT in Event cache.', async () => {
    const updateArgs: UpdateRecordingUrlArgs = {
      eventId,
      recordingUrl: faker.internet.url()
    };

    await updateRecordingUrl(updateArgs);

    expect(Event.cache.has(cacheKey)).toBe(false);
  });

  test('Should invalidate QueryEvent.GET_PAST_EVENTS in Event cache.', async () => {
    const communityId: string = event.community.id;
    cacheKey = `${QueryEvent.GET_PAST_EVENTS}-${communityId}`;

    const updateArgs: UpdateRecordingUrlArgs = {
      eventId,
      recordingUrl: faker.internet.url()
    };

    await getPastEvents({ communityId });
    expect(Event.cache.has(cacheKey)).toBe(true);
    await updateRecordingUrl(updateArgs);
    expect(Event.cache.has(cacheKey)).toBe(false);
  });
});
