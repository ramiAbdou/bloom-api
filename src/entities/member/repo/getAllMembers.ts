import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Member, { MemberStatus } from '../Member';

/**
 * Returns the Member(s) that are ACCEPTED in a Community.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getAllMembers = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().find(
    Member,
    { community: communityId, status: MemberStatus.ACCEPTED },
    { cacheKey: `${QueryEvent.GET_ALL_MEMBERS}-${communityId}` }
  );

  return members;
};

export default getAllMembers;
