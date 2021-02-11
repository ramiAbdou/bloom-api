import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
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
