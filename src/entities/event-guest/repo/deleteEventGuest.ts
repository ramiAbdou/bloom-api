import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class DeleteEventGuestArgs {
  @Field()
  eventId: string;
}

/**
 * Hard deletes the EventGuest. Returns true if successful, throws error
 * otherwise.
 *
 * @param args.eventId - ID of the event.
 * @param ctx.memberId - ID of the member.
 * @param ctx.userId - ID of the user.
 */
const deleteEventGuest = async (
  { eventId }: DeleteEventGuestArgs,
  { memberId }: Pick<GQLContext, 'memberId' | 'userId'>
): Promise<EventGuest> => {
  const guest: EventGuest = await new BloomManager().findOneAndDelete(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    { event: 'DELETE_EVENT_GUEST' }
  );

  return guest;
};

export default deleteEventGuest;
