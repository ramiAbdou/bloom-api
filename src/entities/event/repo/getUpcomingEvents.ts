import { QueryOrder } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import Event from '../Event';

const getUpcomingEvents = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  const events: Event[] = await new BloomManager().find(
    Event,
    { community: { id: communityId }, endTime: { $gte: now() } },
    {
      cacheKey: `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`,
      orderBy: { startTime: QueryOrder.ASC }
    }
  );

  return events;
};

export default getUpcomingEvents;
