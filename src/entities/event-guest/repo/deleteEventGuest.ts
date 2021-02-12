import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
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
 * Invalidates QueryEvent.GET_EVENT and QueryEvent.GET_UPCOMING_EVENTS.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.communityId - Identifier of the community.
 * @param ctx.memberId - Identifier of the member.
 */
const deleteEventGuest = async (
  { eventId }: DeleteEventGuestArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<EventGuest> => {
  return new BloomManager().findOneAndDelete(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'DELETE_EVENT_GUEST'
    }
  );
};

export default deleteEventGuest;
