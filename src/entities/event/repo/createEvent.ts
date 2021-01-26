import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class CreateEventArgs {
  @Field()
  description: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  videoUrl: string;

  @Field({ defaultValue: true })
  private: boolean;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  title: string;
}

const createEvent = async (
  args: CreateEventArgs,
  { communityId }: GQLContext
): Promise<Event> => {
  return new BloomManager().createAndFlush(
    Event,
    { ...args, community: { id: communityId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT'
    }
  );
};

export default createEvent;
