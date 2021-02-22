import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import { FlushEvent } from '@util/events';
import Event from '../Event';

@ArgsType()
export class DeleteEventArgs {
  @Field()
  id: string;
}

const deleteEvent = async ({
  id: eventId
}: DeleteEventArgs): Promise<Event> => {
  const event: Event = await new BloomManager().findOneAndDelete(
    Event,
    { id: eventId },
    { flushEvent: FlushEvent.DELETE_EVENT, soft: true }
  );

  await deleteGoogleCalendarEvent(event.googleCalendarEventId);

  return event;
};

export default deleteEvent;
