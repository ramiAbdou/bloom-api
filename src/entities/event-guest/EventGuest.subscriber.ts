import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import EventGuest from './EventGuest';

@Subscriber()
export default class EventGuestSubscriber
  implements EventSubscriber<EventGuest> {}
