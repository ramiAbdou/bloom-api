import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { emitEmailEvent, emitGoogleEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
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

const createEventGuest = async (
  args: CreateEventGuestArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId' | 'userId'>
) => {
  const { email, eventId, firstName, lastName } = args;
  const { communityId, memberId, userId } = ctx;

  const bm = new BloomManager();

  const user: User = await bm.findOne(User, userId);

  const guestArgs: FilterQuery<EventGuest> = {
    email: email ?? user.email,
    event: eventId,
    firstName: firstName ?? user.firstName,
    lastName: lastName ?? user.lastName,
    member: memberId
  };

  const existingGuest = await bm.findOne(EventGuest, guestArgs);

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest: EventGuest = await bm.createAndFlush(EventGuest, guestArgs, {
    flushEvent: FlushEvent.CREATE_EVENT_GUEST,
    populate: ['member.user']
  });

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { communityId, eventId, guestId: guest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId,
    guestId: guest.id
  });

  return guest;
};

export default createEventGuest;
