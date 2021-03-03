import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Event from '../Event';

@ArgsType()
export class UpdateRecordingUrlArgs {
  @Field()
  eventId: string;

  @Field({ nullable: true })
  recordingUrl?: string;
}

const updateRecordingUrl = async ({
  eventId,
  recordingUrl
}: UpdateRecordingUrlArgs): Promise<Event> => {
  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { recordingUrl },
    { flushEvent: FlushEvent.UPDATE_EVENT_RECORDING_URL }
  );

  return event;
};

export default updateRecordingUrl;
