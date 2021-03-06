import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import EventWatch from '../EventWatch';

@ArgsType()
export class CreateEventWatchArgs {
  @Field()
  eventId: string;
}

/**
 * Returns a new EventWatch.
 *
 * @param args.eventId - ID of the event.
 * @param ctx.memberId - ID of the member.
 */
const createEventWatch = async (
  args: CreateEventWatchArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<EventWatch> => {
  const { eventId } = args;
  const { memberId } = ctx;

  const bm = new BloomManager();

  const [watch, wasFound]: [EventWatch, boolean] = await bm.findOneOrCreate(
    EventWatch,
    { event: eventId, member: memberId },
    { event: eventId, member: memberId }
  );

  if (!wasFound) {
    await bm.flush({ flushEvent: MutationEvent.CREATE_EVENT_WATCH });
  }

  await bm.em.populate(watch, ['member.values', 'member.user']);
  return watch;
};

export default createEventWatch;
