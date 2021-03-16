import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { now } from '@util/util';
import Event from '../Event';

/**
 * Returns all of past Event(s).
 *
 * @param ctx.communityId - ID of the Community.
 */
const getPastEvents = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Event[]> => {
  const { communityId } = ctx;

  const events: Event[] = await new BloomManager().find(
    Event,
    { community: communityId, endTime: { $lt: now() } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENTS}-${communityId}`,
      orderBy: { startTime: QueryOrder.DESC }
    }
  );

  return events;
};

export default getPastEvents;
