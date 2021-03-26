import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

/**
 * Returns the upcoming EventGuest(s).
 *
 * @param ctx.communityId - ID of the Community.
 */
const listUpcomingEventGuests = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventGuest[]> => {
  const { communityId } = ctx;

  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    { event: { community: communityId, endTime: { $gt: now() } } },
    {
      cacheKey: `${QueryEvent.LIST_UPCOMING_EVENT_GUESTS}-${communityId}`,
      filters: false,
      populate: ['member', 'supporter']
    }
  );

  return guests;
};

export default listUpcomingEventGuests;
