import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class GetEventAttendeesArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

const getEventAttendees = async ({
  eventId,
  memberId
}: GetEventAttendeesArgs) => {
  const args: FilterQuery<EventAttendee> = eventId
    ? { event: { id: eventId } }
    : { member: { id: memberId } };

  const cacheKey = eventId
    ? `${QueryEvent.GET_EVENT_ATTENDEES}-${eventId}`
    : `${QueryEvent.GET_EVENT_ATTENDEES}-${memberId}`;

  return new BloomManager().find(EventAttendee, args, {
    cacheKey,
    populate: ['event', 'member.user']
  });
};

export default getEventAttendees;
