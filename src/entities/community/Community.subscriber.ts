import { EntityName, EventSubscriber } from '@mikro-orm/core';

import Community from './Community';

export default class CommunitySubscriber implements EventSubscriber<Community> {
  getSubscribedEntities(): EntityName<Community>[] {
    return [Community];
  }
}
