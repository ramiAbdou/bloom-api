import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Member from '../Member';

const getCommunityMembers = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<Member[]> => {
  return new BloomManager().find(
    Member,
    { community: { id: communityId } },
    { cacheKey: `${QueryEvent.GET_MEMBERS}-${communityId}` }
  );
};

export default getCommunityMembers;
