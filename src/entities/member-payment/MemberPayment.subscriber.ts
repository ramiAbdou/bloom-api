import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import MemberPayment from './MemberPayment';

@Subscriber()
export default class MemberPaymentSubscriber
  implements EventSubscriber<MemberPayment> {}
