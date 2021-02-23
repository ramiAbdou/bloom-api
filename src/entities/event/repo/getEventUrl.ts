import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';

interface GetEventUrlArgs {
  eventId: string;
}

const getEventUrl = async ({ eventId }: GetEventUrlArgs) => {
  const community: Community = await new BloomManager().findOne(
    Community,
    { events: { id: eventId } },
    { fields: ['urlName'] }
  );

  return `${APP.CLIENT_URL}/${community?.urlName}/events/${eventId}`;
};

export default getEventUrl;