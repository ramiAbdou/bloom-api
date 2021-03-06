import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Member from '../Member';

/**
 * Returns the Member(s) of a User.
 *
 * @param ctx.userId - ID of the User (authenticated).
 */
const getMembers = async (
  ctx: Pick<GQLContext, 'userId'>
): Promise<Member[]> => {
  const { userId } = ctx;

  const members: Member[] = await new BloomManager().find(
    Member,
    { user: userId },
    { cacheKey: `${QueryEvent.GET_MEMBERS}-${userId}`, populate: ['community'] }
  );

  return members;
};

export default getMembers;
