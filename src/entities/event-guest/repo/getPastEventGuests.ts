import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

const getPastEventGuests = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  return new BloomManager().find(
    EventGuest,
    { event: { community: { id: communityId }, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_GUESTS}-${communityId}`,
      populate: ['member.user']
    }
  );
};

export default getPastEventGuests;
