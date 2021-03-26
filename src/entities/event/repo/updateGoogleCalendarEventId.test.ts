/**
 * @group integration
 */

import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import {
  communityFactory,
  eventFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import Event from '../Event';
import updateGoogleCalendarEventId, {
  UpdateGoogleCalendarEventIdArgs
} from './updateGoogleCalendarEventId';

describe('updateGoogleCalendarEventId()', () => {
  let event: Event;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      event = await bm.createAndFlush(Event, {
        ...eventFactory.build(),
        community: bm.create(Community, communityFactory.build())
      });
    }
  });

  test('Should update the Event with the googleCalendarEventId.', async () => {
    const updateArgs: UpdateGoogleCalendarEventIdArgs = {
      eventId: event.id,
      googleCalendarEventId: faker.random.uuid()
    };

    const updatedEvent: Event = await updateGoogleCalendarEventId(updateArgs);

    expect(updatedEvent)
      .toHaveProperty('id', updateArgs.eventId)
      .toHaveProperty(
        'googleCalendarEventId',
        updateArgs.googleCalendarEventId
      );
  });
});
