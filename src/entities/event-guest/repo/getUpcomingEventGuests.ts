import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

const getUpcomingEventGuests = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  return new BloomManager().find(
    EventGuest,
    { event: { community: { id: communityId }, endTime: { $gt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_UPCOMING_EVENT_GUESTS}-${communityId}`,
      populate: ['event', 'member.user']
    }
  );
};

export default getUpcomingEventGuests;
