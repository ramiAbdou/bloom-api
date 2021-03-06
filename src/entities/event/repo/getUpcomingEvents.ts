import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import Event from '../Event';

/**
 * Returns all of upcoming Event(s) for a Community.
 *
 * @param ctx.communityId - ID of the Community.
 */
const getUpcomingEvents = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Event[]> => {
  const { communityId } = ctx;

  const events: Event[] = await new BloomManager().find(
    Event,
    { community: communityId, endTime: { $gte: now() } },
    {
      cacheKey: `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`,
      orderBy: { startTime: QueryOrder.ASC }
    }
  );

  return events;
};

export default getUpcomingEvents;
