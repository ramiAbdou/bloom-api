import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field()
  id: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  private?: boolean;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  videoUrl?: string;
}

const updateEvent = async (
  { id: eventId, ...args }: UpdateEventArgs,
  { communityId }: GQLContext
): Promise<Event> => {
  return new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { ...args },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_EVENTS}-${communityId}`
      ],
      event: 'UPDATE_EVENT'
    }
  );
};

export default updateEvent;
