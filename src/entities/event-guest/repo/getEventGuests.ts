import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class GetEventGuestsArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

const getEventGuests = async ({ eventId, memberId }: GetEventGuestsArgs) => {
  const args: FilterQuery<EventGuest> = eventId
    ? { event: { id: eventId } }
    : { member: { id: memberId } };

  return new BloomManager().find(
    EventGuest,
    { ...args },
    {
      cacheKey: eventId
        ? `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`
        : `${QueryEvent.GET_EVENT_GUESTS}-${memberId}`,
      filters: false,
      populate: ['event', 'member.user']
    }
  );
};

export default getEventGuests;
