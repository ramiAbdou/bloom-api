import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';

/**
 * Returns the new Community.
 *
 * Typically called when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
const createCommunity = async (
  args: EntityData<Community>
): Promise<Community> => {
  const { application, ...data } = args;

  const bm: BloomManager = new BloomManager();

  const community: Community = await bm.createAndFlush(Community, {
    ...data,
    application: bm.create(Application, application ?? {}),
    communityIntegrations: bm.create(CommunityIntegrations, {})
  });

  return community;
};

export default createCommunity;
