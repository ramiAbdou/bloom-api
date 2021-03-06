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

/**
 * Returns the updated Event.
 *
 * @param args.eventId - ID of the Event.
 * @param args.recordingUrl - Recording URL of the Event.
 */
const updateRecordingUrl = async (
  args: UpdateRecordingUrlArgs
): Promise<Event> => {
  const { eventId, recordingUrl } = args;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    eventId,
    { recordingUrl },
    { flushEvent: FlushEvent.UPDATE_EVENT_RECORDING_URL }
  );

  return event;
};

export default updateRecordingUrl;
