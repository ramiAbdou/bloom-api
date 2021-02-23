import { QueryOrder } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import Event from '../Event';

const getPastEvents = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  const events: Event[] = await new BloomManager().find(
    Event,
    { community: { id: communityId }, endTime: { $lt: now() } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENTS}-${communityId}`,
      orderBy: { startTime: QueryOrder.DESC }
    }
  );

  return events;
};

export default getPastEvents;
