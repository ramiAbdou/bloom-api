import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import MemberData from './MemberData';

@Subscriber()
export default class MemberDataSubscriber
  implements EventSubscriber<MemberData> {
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
