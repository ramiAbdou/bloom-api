import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import MemberPayment from './MemberPayment';

@Subscriber()
export default class MemberPaymentSubscriber
  implements EventSubscriber<MemberPayment> {
  async afterCreate({ entity }: EventArgs<MemberPayment>) {
    cache.invalidateEntries([
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
