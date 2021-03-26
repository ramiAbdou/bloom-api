import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent, GoogleEvent } from '@util/constants.events';
import Event from '../Event';

@ArgsType()
export class DeleteEventArgs {
  @Field()
  eventId: string;
}

/**
 * Returns the soft-deleted Event.
 *
 * @param args.eventId - ID of the Event.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const deleteEvent = async (
  args: DeleteEventArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Event> => {
  const { eventId } = args;
  const { communityId, memberId } = ctx;

  const event: Event = await new BloomManager().findOneAndDelete(
    Event,
    eventId
  );

  emitEmailEvent(EmailEvent.DELETE_EVENT_COORDINATOR, {
    communityId,
    coordinatorId: memberId,
    eventId
  });

  emitEmailEvent(EmailEvent.DELETE_EVENT_GUESTS, { communityId, eventId });
  emitGoogleEvent(GoogleEvent.DELETE_CALENDAR_EVENT, { eventId });

  return event;
};

export default deleteEvent;
