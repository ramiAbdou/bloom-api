import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

const getIntegrations = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  return new BloomManager().findOne(
    CommunityIntegrations,
    { community: { id: communityId } },
    { cacheKey: `${QueryEvent.GET_INTEGRATIONS}-${communityId}` }
  );
};

export default getIntegrations;
