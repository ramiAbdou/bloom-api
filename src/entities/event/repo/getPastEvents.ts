import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { now } from '@util/util';
import Event from '../Event';

/**
 * Returns all of past Event(s) for a Community.
 *
 * @param ctx.communityId - ID of the Community.
 */
const getPastEvents = async (ctx: Pick<GQLContext, 'communityId'>) => {
  const { communityId } = ctx;

  const events: Event[] = await new BloomManager().find(
    Event,
    { community: communityId, endTime: { $lt: now() } },
    { orderBy: { startTime: QueryOrder.DESC } }
  );

  return events;
};

export default getPastEvents;
