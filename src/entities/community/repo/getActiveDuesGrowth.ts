import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';

const getActiveDuesGrowth = async ({ communityId }: GQLContext) => {
  const cacheKey = `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const numActiveMembers: number = await bm.em.count(Member, {
    community: { id: communityId },
    duesStatus: 'ACTIVE',
    type: { amount: { $gt: 0 } }
  });

  const numTotalMembers: number = await bm.em.count(Member, {
    community: { id: communityId },
    status: 'ACCEPTED',
    type: { amount: { $gt: 0 } }
  });

  const result = Number(
    ((numActiveMembers / numTotalMembers) * 100).toFixed(1)
  );

  return result;
};

export default getActiveDuesGrowth;
