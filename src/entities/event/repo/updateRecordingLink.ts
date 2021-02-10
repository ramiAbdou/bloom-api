import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class UpdateRecordingLinkArgs {
  @Field()
  id: string;

  @Field()
  recordingUrl: string;
}

const updateRecordingLink = async (
  { id: eventId, recordingUrl }: UpdateRecordingLinkArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
): Promise<Event> => {
  return new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { recordingUrl },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_PAST_EVENTS}-${communityId}`
      ],
      event: 'UPDATE_EVENT_RECORDING_LINK'
    }
  );
};

export default updateRecordingLink;
