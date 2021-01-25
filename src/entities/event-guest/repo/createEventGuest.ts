import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestArgs {
  @Field()
  eventId: string;
}

const createEventGuest = async (
  { eventId }: CreateEventGuestArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const [guest] = await new BloomManager().findOneOrCreateAndFlush(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_EVENT_GUESTS_SERIES}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT_GUEST',
      populate: ['member.user']
    }
  );

  return guest;
};

export default createEventGuest;
