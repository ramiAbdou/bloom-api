import day, { Dayjs } from 'dayjs';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { ErrorType } from '@util/constants.errors';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class CreateEventAttendeeWithMemberArgs {
  @Field()
  eventId: string;
}

/**
 * Throws an error if the Event hasn't started yet or if the Event has passed
 * already.
 */
const assertCreateEventAttendee = async (
  args: CreateEventAttendeeWithMemberArgs
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
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventAttendeeWithMember = async (
  args: CreateEventAttendeeWithMemberArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<EventAttendee> => {
  const { eventId } = args;
  const { memberId } = ctx;

  await assertCreateEventAttendee(args);

  const bm: BloomManager = new BloomManager();

  const member: Member = await bm.findOne(Member, { id: memberId });

  const existingAttendee = await bm.findOne(
    EventAttendee,
    { event: eventId, member, supporter: null },
    { populate: ['member'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { event: eventId, member },
    { populate: ['member'] }
  );

  return attendee;
};

export default createEventAttendeeWithMember;
