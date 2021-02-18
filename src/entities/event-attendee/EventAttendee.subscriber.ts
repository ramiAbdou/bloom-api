import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import EventAttendee from './EventAttendee';

@Subscriber()
export default class EventAttendeeSubscriber
  implements EventSubscriber<EventAttendee> {}
