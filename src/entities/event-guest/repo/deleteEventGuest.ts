import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class DeleteEventGuestArgs {
  @Field()
  eventId: string;
}

const deleteEventGuest = async (
  { eventId }: DeleteEventGuestArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<boolean> => {
  console.log('HERE');
  return new BloomManager().findAndDelete(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_EVENT_GUESTS_SERIES}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'DELETE_EVENT_GUEST',
      hard: true
    }
  );
};

export default deleteEventGuest;
