import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/constants.events';
import EventWatch from '../EventWatch';

@ArgsType()
export class CreateEventWatchArgs {
  @Field()
  eventId: string;
}

/**
 * Returns a new EventWatch (w/ Member populated).
 *
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventWatch = async (
  args: CreateEventWatchArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<EventWatch> => {
  const { eventId } = args;
  const { memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const [watch, wasFound]: [EventWatch, boolean] = await bm.findOneOrCreate(
    EventWatch,
    { event: eventId, member: memberId },
    { event: eventId, member: memberId }
  );

  // Populate the Member on the EventWatch (for React).
  await bm.em.populate(watch, ['member']);

  if (!wasFound) {
    await bm.flush({ flushEvent: FlushEvent.CREATE_EVENT_WATCH });
  }

  return watch;
};

export default createEventWatch;
