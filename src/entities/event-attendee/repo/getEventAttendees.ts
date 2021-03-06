import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class GetEventAttendeesArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventAttendee(s) of either an Event or Member.
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const getEventAttendees = async (
  args: GetEventAttendeesArgs
): Promise<EventAttendee[]> => {
  const { eventId, memberId } = args;

  const queryArgs: FilterQuery<EventAttendee> = eventId
    ? { event: eventId }
    : { member: memberId };

  const attendees: EventAttendee[] = await new BloomManager().find(
    EventAttendee,
    { ...queryArgs },
    {
      cacheKey: eventId
        ? `${QueryEvent.GET_EVENT_ATTENDEES}-${eventId}`
        : `${QueryEvent.GET_EVENT_ATTENDEES}-${memberId}`,
      filters: false,
      populate: ['event', 'member', 'supporter']
    }
  );

  return attendees;
};

export default getEventAttendees;
