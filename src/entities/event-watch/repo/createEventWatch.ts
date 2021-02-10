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
  const bm = new BloomManager();

  const [watch, wasFound]: [EventWatch, boolean] = await bm.findOneOrCreate(
    EventWatch,
    { event: { id: eventId }, member: { id: memberId } },
    { event: { id: eventId }, member: { id: memberId } }
  );

  if (!wasFound) {
    await bm.flush({
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT_WATCHES}-${eventId}`,
        `${QueryEvent.GET_PAST_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT_WATCH'
    });
  }

  await bm.em.populate(watch, ['member.data', 'member.user']);
  return watch;
};

export default createEventWatch;
