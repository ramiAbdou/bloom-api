import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import deleteGoogleCalendarEvent from '@integrations/google/repo/deleteGoogleCalendarEvent';
import Event from '../Event';

@ArgsType()
export class DeleteEventArgs {
  @Field()
  id: string;
}

const deleteEvent = async (
  { id: eventId }: DeleteEventArgs,
  { communityId }: GQLContext
): Promise<Event> => {
  const event: Event = await new BloomManager().findOneAndDelete(
    Event,
    { id: eventId },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'DELETE_EVENT',
      soft: true
    }
  );

  setTimeout(async () => {
    if (event.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(event.googleCalendarEventId);
    }
  }, 0);

  return event;
};

export default deleteEvent;
