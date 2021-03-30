import day, { Dayjs } from 'dayjs';
import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import Supporter from '@entities/supporter/Supporter';
import { GQLContext } from '@util/constants';
import { ErrorType } from '@util/constants.errors';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class CreateEventAttendeeArgs {
  @Field({ nullable: true })
  email?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}

/**
 * Throws an error if the Event hasn't started yet or if the Event has passed
 * already.
 */
const assertCreateEventAttendee = async (
  args: CreateEventAttendeeArgs
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
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventAttendee = async (
  args: CreateEventAttendeeArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<EventAttendee> => {
  const { email, eventId, firstName, lastName } = args;
  const { memberId } = ctx;

  await assertCreateEventAttendee(args);

  const bm: BloomManager = new BloomManager();

  const [member, supporter]: [Member, Supporter] = await Promise.all([
    bm.findOne(Member, memberId),
    bm.findOne(Supporter, { community: { members: memberId }, email })
  ]);

  const existingAttendee = await bm.findOne(
    EventAttendee,
    member ? { event: eventId, member } : { event: eventId, supporter },
    { populate: ['member', 'supporter'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendeeArgs: EntityData<EventAttendee> = member
    ? { member }
    : {
        supporter:
          supporter ?? bm.create(Supporter, { email, firstName, lastName })
      };

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { ...attendeeArgs, event: eventId },
    { populate: ['member', 'supporter'] }
  );

  return attendee;
};

export default createEventAttendee;
