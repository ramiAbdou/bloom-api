import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import Event from '../Event';

@ArgsType()
export class GetEventArgs {
  @Field()
  eventId: string;
}

const getEvent = async (args: GetEventArgs) => {
  const event: Event = await new BloomManager().findOne(
    Event,
    { id: args.eventId },
    {
      cacheKey: `${QueryEvent.GET_EVENT}-${args.eventId}`,
      populate: ['community.owner.user']
    }
  );

  return event;
};

export default getEvent;
