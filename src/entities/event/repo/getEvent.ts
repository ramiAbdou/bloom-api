import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import Event from '../Event';

@ArgsType()
export class GetEventArgs {
  @Field()
  eventId: string;
}

/**
 * Returns the Event.
 *
 * @param args.eventId - ID of the Event.
 */
const getEvent = async (args: GetEventArgs) => {
  const { eventId } = args;

  const event: Event = await new BloomManager().findOne(Event, eventId, {
    cacheKey: `${QueryEvent.GET_EVENT}-${eventId}`
  });

  return event;
};

export default getEvent;
