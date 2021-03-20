/**
 * @group integration
 */

import faker from 'faker';

import Community from '@entities/community/Community';
import { buildEvent, initDatabaseIntegrationTest } from '@util/test.util';
import Event from '../Event';
import updateGoogleCalendarEventId, {
  UpdateGoogleCalendarEventIdArgs
} from './updateGoogleCalendarEventId';

describe('updateGoogleCalendarEventId()', () => {
  initDatabaseIntegrationTest([Community, Event]);

  test('Should update the Event with the googleCalendarEventId.', async () => {
    const event: Event = (await buildEvent()) as Event;

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
