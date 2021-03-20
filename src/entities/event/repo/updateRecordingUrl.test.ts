/**
 * @group integration
 */

import day from 'dayjs';
import faker from 'faker';

import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import { buildEvent, initDatabaseIntegrationTest } from '@util/test.util';
import Event from '../Event';
import getPastEvents from './getPastEvents';
import updateRecordingUrl, {
  UpdateRecordingUrlArgs
} from './updateRecordingUrl';

describe('updateRecordingUrl()', () => {
  initDatabaseIntegrationTest([Community, Event]);

  test('Should update the Event with the recordingUrl.', async () => {
    const event: Event = (await buildEvent({
      overrides: {
        endTime: day.utc().subtract(1, 'day'),
        startTime: day.utc().subtract(1, 'day')
      }
    })) as Event;

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
    const event: Event = (await buildEvent({
      overrides: {
        endTime: day.utc().subtract(1, 'day'),
        startTime: day.utc().subtract(1, 'day')
      }
    })) as Event;

    const eventId: string = event.id;
    const cacheKey: string = `${QueryEvent.GET_EVENT}-${eventId}`;

    const updateArgs: UpdateRecordingUrlArgs = {
      eventId,
      recordingUrl: faker.internet.url()
    };

    await updateRecordingUrl(updateArgs);

    expect(Event.cache.has(cacheKey)).toBe(false);
  });

  test('Should invalidate QueryEvent.GET_PAST_EVENTS in Event cache.', async () => {
    const event: Event = (await buildEvent({
      overrides: {
        endTime: day.utc().subtract(1, 'day'),
        startTime: day.utc().subtract(1, 'day')
      }
    })) as Event;

    const eventId: string = event.id;
    const communityId: string = event.community.id;
    const cacheKey: string = `${QueryEvent.GET_PAST_EVENTS}-${communityId}`;

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
