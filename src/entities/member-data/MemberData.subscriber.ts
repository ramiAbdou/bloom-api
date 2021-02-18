import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import MemberData from './MemberData';

@Subscriber()
export default class MemberDataSubscriber
  implements EventSubscriber<MemberData> {}
