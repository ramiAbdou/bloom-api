import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { now } from '@util/util';
import EventAttendee from '../EventAttendee';

/**
 * Returns the past EventAttendee(s) of a Community.
 *
 * @param ctx.communityId - ID of the Community.
 */
const getPastEventAttendees = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventAttendee[]> => {
  const { communityId } = ctx;

  const attendees: EventAttendee[] = await new BloomManager().find(
    EventAttendee,
    { event: { community: communityId, endTime: { $lt: now() } } },
    { filters: false, populate: ['event', 'member', 'supporter'] }
  );

  return attendees;
};

export default getPastEventAttendees;
