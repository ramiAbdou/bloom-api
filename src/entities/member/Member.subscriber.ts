import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import { hasKeys } from '@util/util';
import Member, { MemberStatus } from './Member';

export default class MemberSubscriber implements EventSubscriber<Member> {
  getSubscribedEntities(): EntityName<Member>[] {
    return [Member];
  }

  async afterUpdate({ changeSet, entity: member }: EventArgs<Member>) {
    cache.invalidateKeys([`${QueryEvent.GET_MEMBER}-${member.id}`]);

    const { originalEntity, payload } = changeSet;

    if (
      originalEntity?.status === MemberStatus.PENDING &&
      member?.status !== MemberStatus.PENDING
    ) {
      cache.invalidateKeys([
        `${QueryEvent.GET_APPLICANTS}-${member.community.id}`
      ]);
    }

    if (
      hasKeys(payload, ['deletedAt', 'role']) ||
      payload?.status === MemberStatus.ACCEPTED
    ) {
      cache.invalidateKeys([
        `${QueryEvent.GET_DATABASE}-${member.community.id}`,
        `${QueryEvent.GET_DIRECTORY}-${member.community.id}`
      ]);
    }
  }
}
