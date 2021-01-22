import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class DeleteEventArgs {
  @Field()
  id: string;
}

const deleteEvent = async (
  { id: eventId }: DeleteEventArgs,
  { communityId }: GQLContext
): Promise<boolean> => {
  return new BloomManager().findAndDelete(
    Event,
    { id: eventId },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_EVENTS}-${communityId}`
      ],
      event: 'DELETE_EVENT'
    }
  );
};

export default deleteEvent;
