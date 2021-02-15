import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '../Community';

const getCommunityOwner = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<Community> => {
  const community: Community = await new BloomManager().findOne(
    Community,
    { id: communityId },
    {
      cacheKey: `${QueryEvent.GET_OWNER}-${communityId}`,
      populate: ['owner.user']
    }
  );

  return community;
};

export default getCommunityOwner;
