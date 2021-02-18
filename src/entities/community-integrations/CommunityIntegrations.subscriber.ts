import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import CommunityIntegrations from './CommunityIntegrations';

@Subscriber()
export default class CommunityIntegrationsSubscriber
  implements EventSubscriber<CommunityIntegrations> {}
