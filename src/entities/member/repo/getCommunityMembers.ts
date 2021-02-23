import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
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
