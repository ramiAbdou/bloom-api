import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import MemberPayment from './MemberPayment';

@Subscriber()
export default class MemberPaymentSubscriber
  implements EventSubscriber<MemberPayment> {
  async afterUpdate({ entity }: EventArgs<MemberPayment>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_PAYMENTS}-${entity.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${entity.member.id}`
    ]);
  }
}
