import { EntityName, EventSubscriber } from '@mikro-orm/core';

import CommunityApplication from './CommunityApplication';

export default class CommunityApplicationSubscriber
  implements EventSubscriber<CommunityApplication> {
  getSubscribedEntities(): EntityName<CommunityApplication>[] {
    return [CommunityApplication];
  }
}
