import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
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
      populate: ['community.owner.user']
    }
  );
};

export default getEvent;
