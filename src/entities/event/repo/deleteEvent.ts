import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
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
    { event: FlushEvent.DELETE_EVENT, soft: true }
  );

  return event;
};

export default deleteEvent;
