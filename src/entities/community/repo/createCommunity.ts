import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import { FlushEvent } from '@util/events';

/**
 * Creates a new community when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
const createCommunity = async ({
  application,
  ...data
}: EntityData<Community>): Promise<Community> => {
  const bm = new BloomManager();

  const community: Community = bm.create(Community, {
    ...data,
    application: bm.create(Application, application ?? {}),
    integrations: bm.create(CommunityIntegrations, {})
  });

  await bm.flush({ flushEvent: FlushEvent.CREATE_COMMUNITY });

  return community;
};

export default createCommunity;
