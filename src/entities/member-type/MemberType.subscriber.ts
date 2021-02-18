import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import MemberType from './MemberType';

@Subscriber()
export default class MemberTypeSubscriber
  implements EventSubscriber<MemberType> {}
