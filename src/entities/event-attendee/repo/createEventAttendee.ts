import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
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
 * @param args.eventId - Identifier of the event.
 * @param ctx.memberId - Identifier of the member.
 * @param ctx.userId - Identifier of the user.
 */
const createEventAttendee = async (
  { eventId, ...args }: CreateEventAttendeeArgs,
  { memberId, userId }: Pick<GQLContext, 'memberId' | 'userId'>
) => {
  const user = await new BloomManager().findOne(
    User,
    { id: userId },
    { fields: ['email', 'firstName', 'lastName'] }
  );

  const attendeeArgs: FilterQuery<EventAttendee> = {
    email: args.email ?? user.email,
    event: eventId,
    firstName: args.email ?? user.firstName,
    lastName: args.email ?? user.lastName,
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
