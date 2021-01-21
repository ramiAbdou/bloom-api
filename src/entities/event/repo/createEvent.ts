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

  @Field()
  title: string;
}

const createEvent = async (
  args: CreateEventArgs,
  { communityId }: GQLContext
): Promise<Event> => {
  const bm = new BloomManager();

  const event: Event = bm.create(Event, {
    ...args,
    community: { id: communityId }
  });

  await bm.flush({
    cacheKeysToInvalidate: [`${QueryEvent.GET_EVENTS}-${communityId}`],
    event: 'CREATE_EVENT'
  });

  return event;
};

export default createEvent;
