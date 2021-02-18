import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import Member from './Member';

@Subscriber()
export default class MemberSubscriber implements EventSubscriber<Member> {}
