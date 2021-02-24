import jwt from 'jsonwebtoken';

import { APP, JWT } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import URLBuilder from '@util/URLBuilder';

interface GetEventGuestJoinUrlArgs {
  eventId: string;
  guestId: string;
}

const getEventGuestJoinUrl = async ({
  eventId,
  guestId
}: GetEventGuestJoinUrlArgs) => {
  const community: Community = await new BloomManager().findOne(
    Community,
    { events: { id: eventId } },
    { fields: ['urlName'] }
  );

  const token: string = jwt.sign({ guestId }, JWT.SECRET);

  const joinUrl: string = new URLBuilder(
    `${APP.CLIENT_URL}/${community?.urlName}/events/${eventId}`
  ).addParam('joinToken', token).url;

  return joinUrl;
};

export default getEventGuestJoinUrl;
