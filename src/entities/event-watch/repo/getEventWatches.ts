import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventWatch from '../EventWatch';

@ArgsType()
export class GetEventWatchesArgs {
  @Field()
  eventId: string;
}

const getEventWatches = async ({
  eventId
}: GetEventWatchesArgs): Promise<EventWatch[]> => {
  return new BloomManager().find(
    EventWatch,
    { event: { id: eventId } },
    {
      cacheKey: `${QueryEvent.GET_EVENT_WATCHES}-${eventId}`,
      populate: ['event', 'member.user']
    }
  );
};

export default getEventWatches;
