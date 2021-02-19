import { ArgsType, Field } from 'type-graphql';

import { FlushEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Event from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  googleCalendarEventId?: string;

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

const updateEvent = async ({
  id: eventId,
  ...args
}: UpdateEventArgs): Promise<Event> => {
  let flushEvent: FlushEvent;

  if (args?.recordingUrl) flushEvent = FlushEvent.UPDATE_EVENT_RECORDING_LINK;
  else if (args?.googleCalendarEventId) {
    flushEvent = FlushEvent.ATTACH_GOOGLE_CALENDAR_EVENT;
  } else flushEvent = FlushEvent.UPDATE_EVENT;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { ...args },
    { event: flushEvent }
  );

  return event;
};

export default updateEvent;
