import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import User from './User';

@Subscriber()
export default class UserSubscriber implements EventSubscriber<User> {}
