import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

const getUpcomingEventGuests = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<EventGuest[]> => {
  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    { event: { community: { id: communityId }, endTime: { $gt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_UPCOMING_EVENT_GUESTS}-${communityId}`,
      filters: false,
      populate: ['member', 'supporter']
    }
  );

  return guests;
};

export default getUpcomingEventGuests;
