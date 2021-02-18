import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import EventWatch from './EventWatch';

@Subscriber()
export default class EventWatchSubscriber
  implements EventSubscriber<EventWatch> {}
