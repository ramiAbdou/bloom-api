import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import eventBus from '@core/events/eventBus';
import { BusEvent, FlushEvent, GoogleEvent } from '@util/events';
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

  eventBus.emit(BusEvent.GOOGLE_EVENT, {
    eventId,
    googleEvent: GoogleEvent.DELETE_GOOGLE_CALENDAR_EVENT
  });

  return event;
};

export default deleteEvent;
