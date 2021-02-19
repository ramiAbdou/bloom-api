import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import CommunityIntegrations from './CommunityIntegrations';

export default class CommunityIntegrationsSubscriber
  implements EventSubscriber<CommunityIntegrations> {
  getSubscribedEntities(): EntityName<CommunityIntegrations>[] {
    return [CommunityIntegrations];
  }

  /**
   * Invalidates GET_INTEGRATIONS.
   *
   * Sends email confirmation to all admins of the community as well.
   */
  async afterUpdate({ entity }: EventArgs<CommunityIntegrations>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_INTEGRATIONS}-${entity.community.id}`
    ]);
  }
}
