import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
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
    cache.invalidateKeys([
      `${QueryEvent.GET_INTEGRATIONS}-${entity.community.id}`
    ]);
  }
}
