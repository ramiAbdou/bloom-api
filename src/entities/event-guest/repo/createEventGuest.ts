import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@core/events/emitEmailEvent';
import User from '@entities/user/User';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
import emitGoogleEvent from '../../../core/events/emitGoogleEvent';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestArgs {
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
 * Returns a new EventGuest.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.memberId - Identifier of the member.
 * @param ctx.userId - Identifier of the user.
 */
const createEventGuest = async (
  args: CreateEventGuestArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId' | 'userId'>
) => {
  const user = await new BloomManager().findOne(
    User,
    { id: ctx.userId },
    { fields: ['email', 'firstName', 'lastName'] }
  );

  const guestArgs: FilterQuery<EventGuest> = {
    email: args.email ?? user.email,
    event: args.eventId,
    firstName: args.email ?? user.firstName,
    lastName: args.email ?? user.lastName,
    member: ctx.memberId
  };

  const existingGuest = await new BloomManager().findOne(EventGuest, guestArgs);

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest: EventGuest = await new BloomManager().createAndFlush(
    EventGuest,
    guestArgs,
    { flushEvent: FlushEvent.CREATE_EVENT_GUEST, populate: ['member.user'] }
  );

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { communityId: ctx.communityId, eventId: args.eventId, guestId: guest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId: args.eventId,
    guestId: guest.id
  });

  return guest;
};

export default createEventGuest;
