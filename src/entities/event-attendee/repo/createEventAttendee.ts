import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../../user/User';
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

const createEventAttendee = async (
  { email, firstName, lastName, eventId }: CreateEventAttendeeArgs,
  { memberId, userId }: Pick<GQLContext, 'communityId' | 'memberId' | 'userId'>
) => {
  const partialUser: Pick<User, 'email' | 'firstName' | 'lastName'> = email
    ? { email, firstName, lastName }
    : await new BloomManager().findOne(
        User,
        { id: userId },
        { fields: ['email', 'firstName', 'lastName'] }
      );

  const baseArgs: FilterQuery<EventAttendee> = {
    email: partialUser.email,
    event: { id: eventId },
    member: { id: memberId }
  };

  const existingAttendee = await new BloomManager().findOne(
    EventAttendee,
    baseArgs
  );

  if (existingAttendee) {
    throw new Error('An attendee with this email has already joined.');
  }

  const attendee = await new BloomManager().createAndFlush(
    EventAttendee,
    { ...baseArgs, ...partialUser },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${eventId}`
      ],
      event: 'CREATE_EVENT_ATTENDEE',
      populate: ['member.data', 'member.user']
    }
  );

  return attendee;
};

export default createEventAttendee;
