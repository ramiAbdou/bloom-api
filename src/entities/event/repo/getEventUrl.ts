import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { APP } from '@util/constants';

interface GetEventUrlArgs {
  eventId: string;
}

/**
 * Returns the Event.
 *
 * @param args.eventId - ID of the event.
 */
const getEventUrl = async (args: GetEventUrlArgs): Promise<string> => {
  const { eventId } = args;

  const community: Community = await new BloomManager().findOne(
    Community,
    { events: eventId },
    { fields: ['urlName'] }
  );

  return `${APP.CLIENT_URL}/${community?.urlName}/events/${eventId}`;
};

export default getEventUrl;
