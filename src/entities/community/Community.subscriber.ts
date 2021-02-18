import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import Community from './Community';

@Subscriber()
export default class CommunitySubscriber
  implements EventSubscriber<Community> {}
