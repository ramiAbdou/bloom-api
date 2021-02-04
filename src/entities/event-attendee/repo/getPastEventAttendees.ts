import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import EventAttendee from '../EventAttendee';

const getPastEventAttendees = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  return new BloomManager().find(
    EventAttendee,
    { event: { community: { id: communityId }, endTime: { $lt: now() } } },
    {
      cacheKey: `${QueryEvent.GET_PAST_EVENT_ATTENDEES}-${communityId}`,
      populate: ['event', 'member.user']
    }
  );
};

export default getPastEventAttendees;
