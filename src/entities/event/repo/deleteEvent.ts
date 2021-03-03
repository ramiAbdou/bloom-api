import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent, emitGoogleEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
import Event from '../Event';

@ArgsType()
export class DeleteEventArgs {
  @Field()
  id: string;
}

const deleteEvent = async (
  { id: eventId }: DeleteEventArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Event> => {
  const event: Event = await new BloomManager().findOneAndDelete(
    Event,
    { id: eventId },
    { flushEvent: FlushEvent.DELETE_EVENT, soft: true }
  );

  emitEmailEvent(EmailEvent.DELETE_EVENT_COORDINATOR, {
    communityId,
    coordinatorId: memberId,
    eventId
  });

  emitEmailEvent(EmailEvent.DELETE_EVENT_GUESTS, {
    communityId,
    eventId
  });

  emitGoogleEvent(GoogleEvent.DELETE_CALENDAR_EVENT, { eventId });

  return event;
};

export default deleteEvent;
