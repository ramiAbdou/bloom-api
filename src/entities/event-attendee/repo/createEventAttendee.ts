import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
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
 * Returns a new EventAttendee.
 *
 * @param args.email - Email of the NON-MEMBER attendee.
 * @param args.firstName - First name of the NON-MEMBER attendee.
 * @param args.lastName - Last name of the NON-MEMBER attendee.
 * @param args.eventId - ID of the event.
 * @param ctx.memberId - ID of the member.
 */
const createEventAttendee = async (
  { eventId, ...args }: CreateEventAttendeeArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
) => {
  const member = await new BloomManager().findOne(Member, memberId, {
    populate: ['user']
  });

  const attendeeArgs: FilterQuery<EventAttendee> = {
    email: args.email ?? member.user.email,
    event: eventId,
    firstName: args.email ?? member.firstName,
    lastName: args.email ?? member.lastName,
    member: memberId
  };

  const existingAttendee = await new BloomManager().findOne(
    EventAttendee,
    attendeeArgs,
    { populate: ['member.user'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendee = await new BloomManager().createAndFlush(
    EventAttendee,
    attendeeArgs,
    { flushEvent: FlushEvent.CREATE_EVENT_ATTENDEE, populate: ['member.user'] }
  );

  return attendee;
};

export default createEventAttendee;
