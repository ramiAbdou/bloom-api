import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import MemberPayment from './MemberPayment';

export default class MemberPaymentSubscriber
  implements EventSubscriber<MemberPayment> {
  getSubscribedEntities(): EntityName<MemberPayment>[] {
    return [MemberPayment];
  }

  async afterCreate({ entity }: EventArgs<MemberPayment>) {
    cache.invalidateKeys([
      `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${entity.community.id}`,
      `${QueryEvent.GET_DATABASE}-${entity.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${entity.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${entity.member.id}`,
      `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${entity.community.id}`,
      `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${entity.community.id}`,
      `${QueryEvent.GET_TOTAL_DUES_SERIES}-${entity.community.id}`
    ]);
  }
}
