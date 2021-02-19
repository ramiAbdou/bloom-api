import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import Member from '../Member';

const getMembers = async ({
  userId
}: Pick<GQLContext, 'userId'>): Promise<Member[]> => {
  return new BloomManager().find(
    Member,
    { user: { id: userId } },
    { cacheKey: `${QueryEvent.GET_MEMBERS}-${userId}`, populate: ['community'] }
  );
};

export default getMembers;
