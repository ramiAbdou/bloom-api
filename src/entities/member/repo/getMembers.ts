import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Member from '../Member';

const getMembers = async ({
  userId
}: Pick<GQLContext, 'userId'>): Promise<Member[]> => {
  const members: Member[] = await new BloomManager().find(
    Member,
    { user: { id: userId } },
    { cacheKey: `${QueryEvent.GET_MEMBERS}-${userId}`, populate: ['community'] }
  );

  return members;
};

export default getMembers;
