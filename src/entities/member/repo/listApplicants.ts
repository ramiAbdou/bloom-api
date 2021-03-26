import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import Member, { MemberStatus } from '../Member';

/**
 * Returns the Member(s) that are PENDING in a Community.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listApplicants = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Member[]> => {
  const { communityId } = ctx;

  const members: Member[] = await new BloomManager().find(
    Member,
    { community: communityId, status: MemberStatus.PENDING },
    {
      cacheKey: `${QueryEvent.LIST_APPLICANTS}-${communityId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['values']
    }
  );

  return members;
};

export default listApplicants;
