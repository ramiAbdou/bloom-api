import day, { Dayjs } from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import { ErrorType } from '@util/constants.errors';

interface AssertCreateEventAttendeeArgs {
  eventId: string;
}

/**
 * Throws an error if the Event hasn't started yet or if the Event has passed
 * already.
 *
 * @throws - Will throw Error if less than 10 minutes before startTime.
 * @throws - Will throw Error if more than 10 minutes after endTime.
 */
const assertCreateEventAttendee = async (
  args: AssertCreateEventAttendeeArgs
): Promise<void> => {
  const event: Event = await new BloomManager().em.findOne(
    Event,
    { id: args.eventId },
    { fields: ['endTime', 'startTime'] }
  );

  const tenMinutesBeforeEvent: Dayjs = day
    .utc(event.startTime)
    .subtract(10, 'minute');

  const tenMinutesAfterEvent: Dayjs = day.utc(event.endTime).add(10, 'minute');

  if (day.utc().isBefore(tenMinutesBeforeEvent)) {
    throw new Error(ErrorType.EVENT_HASNT_STARTED);
  }

  if (day.utc().isAfter(tenMinutesAfterEvent)) {
    throw new Error(ErrorType.EVENT_FINISHED);
  }
};

export default assertCreateEventAttendee;
