import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import EventWatch from '../EventWatch';

/**
 * Returns the past EventWatch(s) of a Community.
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const getPastEventWatches = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventWatch[]> => {
  const { communityId } = ctx;

  const watches: EventWatch[] = await new BloomManager().find(
    EventWatch,
    { event: { community: communityId, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_WATCHES}-${communityId}`,
      populate: ['event', 'member']
    }
  );

  return watches;
};

export default getPastEventWatches;
