import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
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
    { event: 'DELETE_EVENT', soft: true }
  );

  setTimeout(async () => {
    if (event.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(event.googleCalendarEventId);
    }
  }, 0);

  return event;
};

export default deleteEvent;
