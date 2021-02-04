import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../../user/User';
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
 * Invalidates QueryEvent.GET_EVENT and QueryEvent.GET_PAST_EVENTS.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.communityId - Identifier of the community.
 * @param ctx.memberId - Identifier of the member.
 */
const createEventGuest = async (
  { email, firstName, lastName, eventId }: CreateEventGuestArgs,
  {
    communityId,
    memberId,
    userId
  }: Pick<GQLContext, 'communityId' | 'memberId' | 'userId'>
) => {
  const partialUser: Pick<User, 'email' | 'firstName' | 'lastName'> = email
    ? { email, firstName, lastName }
    : await new BloomManager().findOne(
        User,
        { id: userId },
        { fields: ['email', 'firstName', 'lastName'] }
      );

  const baseArgs: FilterQuery<EventGuest> = {
    email: partialUser.email,
    event: { id: eventId },
    member: { id: memberId }
  };

  const existingGuest = await new BloomManager().findOne(EventGuest, baseArgs);

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest = await new BloomManager().createAndFlush(
    EventGuest,
    { ...baseArgs, ...partialUser },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT_GUEST',
      populate: ['member.user']
    }
  );

  return guest;
};

export default createEventGuest;
