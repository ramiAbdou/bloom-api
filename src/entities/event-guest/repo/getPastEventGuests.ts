import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

const getPastEventGuests = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    { event: { community: { id: communityId }, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_GUESTS}-${communityId}`,
      filters: false,
      populate: ['event', 'member.user']
    }
  );

  return guests;
};

export default getPastEventGuests;
