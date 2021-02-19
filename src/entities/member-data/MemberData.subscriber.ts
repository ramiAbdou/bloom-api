import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/db/cache';
import MemberData from './MemberData';

export default class MemberDataSubscriber
  implements EventSubscriber<MemberData> {
  getSubscribedEntities(): EntityName<MemberData>[] {
    return [MemberData];
  }

  async afterCreate({ entity }: EventArgs<MemberData>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_MEMBER_DATA}-${entity.member.id}`
    ]);
  }

  async afterUpdate({ entity }: EventArgs<MemberData>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_MEMBER_DATA}-${entity.member.id}`
    ]);
  }
}
