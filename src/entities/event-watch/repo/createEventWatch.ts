import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import EventWatch from '../EventWatch';

@ArgsType()
export class CreateEventWatchArgs {
  @Field()
  eventId: string;
}

/**
 * Returns a new EventWatch.
 *
 * @param args.eventId - Identifier of the event.
 * @param ctx.memberId - Identifier of the member.
 */
const createEventWatch = async (
  { eventId }: CreateEventWatchArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
) => {
  const bm = new BloomManager();

  const [watch, wasFound]: [EventWatch, boolean] = await bm.findOneOrCreate(
    EventWatch,
    { event: { id: eventId }, member: { id: memberId } },
    { event: { id: eventId }, member: { id: memberId } }
  );

  if (!wasFound) await bm.flush({ flushEvent: FlushEvent.CREATE_EVENT_WATCH });
  await bm.em.populate(watch, ['member.data', 'member.user']);
  return watch;
};

export default createEventWatch;
