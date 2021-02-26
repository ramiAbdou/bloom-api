import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import EventWatch from '../EventWatch';

const getPastEventWatches = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  return new BloomManager().find(
    EventWatch,
    { event: { community: { id: communityId }, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_WATCHES}-${communityId}`,
      populate: ['member.user']
    }
  );
};

export default getPastEventWatches;
