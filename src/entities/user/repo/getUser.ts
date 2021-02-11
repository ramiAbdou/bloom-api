import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../User';

const getUser = async ({
  userId
}: Pick<GQLContext, 'userId'>): Promise<User> => {
  const user: User = await new BloomManager().findOneOrFail(
    User,
    { id: userId },
    {
      cacheKey: `${QueryEvent.GET_USER}-${userId}`,
      populate: ['members.community', 'members.community', 'members']
    }
  );

  return user;
};

export default getUser;
