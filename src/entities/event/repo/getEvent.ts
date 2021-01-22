import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class GetEventArgs {
  @Field()
  eventId: string;
}

const getEvent = async ({ eventId }: GetEventArgs) => {
  return new BloomManager().findOne(
    Event,
    { id: eventId },
    {
      cacheKey: `${QueryEvent.GET_EVENT}-${eventId}`,
      populate: ['community', 'guests.member']
    }
  );
};

export default getEvent;
