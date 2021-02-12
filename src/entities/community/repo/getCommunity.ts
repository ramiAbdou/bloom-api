import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '../Community';

const getCommunity = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<Community> => {
  return new BloomManager().findOneOrFail(
    Community,
    { id: communityId },
    { cacheKey: `${QueryEvent.GET_COMMUNITY}-${communityId}` }
  );
};

export default getCommunity;
