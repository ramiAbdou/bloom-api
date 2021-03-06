import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import { now } from '@util/util';
import EventGuest from '../EventGuest';

/**
 * Returns the past EventGuest(s) of a Community.
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const getPastEventGuests = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventGuest[]> => {
  const { communityId } = ctx;

  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    { event: { community: communityId, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_GUESTS}-${communityId}`,
      filters: false,
      populate: ['member', 'supporter']
    }
  );

  return guests;
};

export default getPastEventGuests;
