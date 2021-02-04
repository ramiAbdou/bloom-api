import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class GetEventGuestsArgs {
  @Field()
  eventId: string;
}

const getEventGuests = async ({ eventId }: GetEventGuestsArgs) => {
  return new BloomManager().find(
    EventGuest,
    { event: { id: eventId } },
    {
      cacheKey: `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`,
      populate: ['event', 'member.user']
    }
  );
};

export default getEventGuests;
