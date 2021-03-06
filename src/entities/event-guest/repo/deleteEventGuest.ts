import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitGoogleEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { FlushEvent, GoogleEvent } from '@util/events';
import EventGuest from '../EventGuest';

@ArgsType()
export class DeleteEventGuestArgs {
  @Field()
  eventId: string;
}

/**
 * Returns the deleted EventGuest. Returns true if successful, throws error
 * otherwise.
 *
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 * @param ctx.userId - ID of the User (authenticated).
 */
const deleteEventGuest = async (
  args: DeleteEventGuestArgs,
  ctx: Pick<GQLContext, 'memberId' | 'userId'>
): Promise<EventGuest> => {
  const { eventId } = args;
  const { memberId } = ctx;

  const guest: EventGuest = await new BloomManager().findOneAndDelete(
    EventGuest,
    { event: eventId, member: memberId },
    { flushEvent: FlushEvent.DELETE_EVENT_GUEST }
  );

  emitGoogleEvent(GoogleEvent.DELETE_CALENDAR_EVENT_ATTENDEE, {
    eventId,
    guestId: guest.id
  });

  return guest;
};

export default deleteEventGuest;
