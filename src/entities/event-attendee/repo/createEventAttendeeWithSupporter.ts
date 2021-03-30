import day, { Dayjs } from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Supporter from '@entities/supporter/Supporter';
import { ErrorType } from '@util/constants.errors';
import createSupporter from '../../supporter/repo/createSupporter';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class CreateEventAttendeeWithSupporterArgs {
  @Field({ nullable: true })
  email?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  supporterId?: string;
}

/**
 * Throws an error if the Event hasn't started yet or if the Event has passed
 * already.
 */
const assertCreateEventAttendee = async (
  args: CreateEventAttendeeWithSupporterArgs
): Promise<void> => {
  const event: Event = await new BloomManager().findOne(
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

/**
 * Returns a new EventAttendee.
 *
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.eventId - ID of the Event.
 */
const createEventAttendeeWithSupporter = async (
  args: CreateEventAttendeeWithSupporterArgs
): Promise<EventAttendee> => {
  const { email, eventId, firstName, lastName, supporterId } = args;

  await assertCreateEventAttendee(args);

  const bm: BloomManager = new BloomManager();

  const event: Event = await bm.findOne(Event, { id: eventId });

  const supporter: Supporter = await createSupporter({
    communityId: event.community.id,
    email,
    firstName,
    lastName,
    supporterId
  });

  const existingAttendee: EventAttendee = await bm.findOne(
    EventAttendee,
    { event: eventId, member: null, supporter: supporter.id },
    { populate: ['supporter'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { event: eventId, supporter: supporter.id },
    { populate: ['supporter'] }
  );

  return attendee;
};

export default createEventAttendeeWithSupporter;
