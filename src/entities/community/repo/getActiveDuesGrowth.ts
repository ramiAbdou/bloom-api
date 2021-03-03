import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import Member, { MemberStatus } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';

const getActiveDuesGrowth = async ({ communityId }: GQLContext) => {
  const cacheKey = `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const numActiveMembers: number = await bm.em.count(Member, {
    community: { id: communityId },
    isDuesActive: true,
    type: { amount: { $gt: 0 } }
  });

  const numTotalMembers: number = await bm.em.count(Member, {
    community: { id: communityId },
    status: MemberStatus.ACCEPTED,
    type: { amount: { $gt: 0 } }
  });

  const result = Number(
    ((numActiveMembers / numTotalMembers) * 100).toFixed(1)
  );

  return result;
};

export default getActiveDuesGrowth;
