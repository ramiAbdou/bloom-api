import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import EventAttendee from '../EventAttendee';
import assertCreateEventAttendee from './assertCreateEventAttendee';

@ArgsType()
export class CreateEventAttendeeWithMemberArgs {
  @Field()
  eventId: string;
}

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
