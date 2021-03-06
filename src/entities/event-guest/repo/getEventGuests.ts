import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import EventGuest from '../EventGuest';

@ArgsType()
export class GetEventGuestsArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventGuest(s) of either the Event or Member.
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const getEventGuests = async (
  args: GetEventGuestsArgs
): Promise<EventGuest[]> => {
  const { eventId, memberId } = args;

  const queryArgs: FilterQuery<EventGuest> = eventId
    ? { event: eventId }
    : { member: memberId };

  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    { ...queryArgs },
    {
      cacheKey: eventId
        ? `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`
        : `${QueryEvent.GET_EVENT_GUESTS}-${memberId}`,
      filters: false,
      populate: ['event', 'member', 'supporter']
    }
  );

  return guests;
};

export default getEventGuests;
