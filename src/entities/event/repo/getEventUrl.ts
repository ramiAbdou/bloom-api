import { APP, GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';

interface GetEventUrlArgs {
  eventId: string;
}

const getEventUrl = async (
  { eventId }: GetEventUrlArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const community: Community = await new BloomManager().findOne(Community, {
    id: communityId
  });

  return `${APP.CLIENT_URL}/${community.urlName}/events/${eventId}`;
};

export default getEventUrl;
