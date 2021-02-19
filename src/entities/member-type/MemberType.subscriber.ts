import { EntityName, EventSubscriber } from '@mikro-orm/core';

import MemberType from './MemberType';

export default class MemberTypeSubscriber
  implements EventSubscriber<MemberType> {
  getSubscribedEntities(): EntityName<MemberType>[] {
    return [MemberType];
  }
}
