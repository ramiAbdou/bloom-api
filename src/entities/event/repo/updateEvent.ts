import { ArgsType, Field } from 'type-graphql';

import { GQLContext, LoggerEvent, QueryEvent } from '@constants';
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
  recordingUrl?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  videoUrl?: string;
}

const updateEvent = async (
  { id: eventId, ...args }: UpdateEventArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
): Promise<Event> => {
  const event: LoggerEvent = args?.recordingUrl
    ? 'UPDATE_EVENT_RECORDING_LINK'
    : 'UPDATE_EVENT';

  return new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { ...args },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        ...(args?.recordingUrl
          ? [`${QueryEvent.GET_PAST_EVENTS}-${communityId}`]
          : [`${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`])
      ],
      event
    }
  );
};

export default updateEvent;
