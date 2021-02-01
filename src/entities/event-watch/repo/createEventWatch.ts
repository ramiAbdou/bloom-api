import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventWatch from '../EventWatch';

@ArgsType()
export class CreateEventWatchArgs {
  @Field()
  eventId: string;
}

/**
 * Returns a new EventWatch.
 *
 * Invalidates QueryEvent.GET_EVENT and QueryEvent.GET_PAST_EVENTS.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.communityId - Identifier of the community.
 * @param ctx.memberId - Identifier of the member.
 */
const createEventWatch = async (
  { eventId }: CreateEventWatchArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  return new BloomManager().createAndFlush(
    EventWatch,
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT}-${eventId}`,
        `${QueryEvent.GET_PAST_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT_WATCH',
      populate: ['member.data', 'member.user']
    }
  );
};

export default createEventWatch;
