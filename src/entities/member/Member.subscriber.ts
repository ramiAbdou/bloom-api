import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import Member from './Member';
import { MemberStatus } from './Member.types';

@Subscriber()
export default class MemberSubscriber implements EventSubscriber<Member> {
  async afterUpdate({ changeSet, entity }: EventArgs<Member>) {
    const { originalEntity, payload } = changeSet;

    cache.invalidateEntries([`${QueryEvent.GET_MEMBER}-${entity.id}`]);

    if (originalEntity?.status === MemberStatus.PENDING) {
      cache.invalidateEntries([
        `${QueryEvent.GET_APPLICANTS}-${entity.community.id}`
      ]);
    }

    if (
      'deletedAt' in payload ||
      'role' in payload ||
      payload?.status === MemberStatus.ACCEPTED
    ) {
      cache.invalidateEntries([
        `${QueryEvent.GET_DATABASE}-${entity.community.id}`,
        `${QueryEvent.GET_DIRECTORY}-${entity.community.id}`
      ]);
    }
  }
}
