import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import CommunityApplication from './CommunityApplication';

@Subscriber()
export default class CommunityApplicationSubscriber
  implements EventSubscriber<CommunityApplication> {}
