import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import CommunityIntegrations from './CommunityIntegrations';

@Subscriber()
export default class CommunityIntegrationsSubscriber
  implements EventSubscriber<CommunityIntegrations> {
  async afterUpdate({ entity }: EventArgs<CommunityIntegrations>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_INTEGRATIONS}-${entity.community.id}`
    ]);
  }
}
