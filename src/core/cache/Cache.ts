import LRUCache from 'lru-cache';
import { EntityName } from '@mikro-orm/core';

import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import EventInvitee from '@entities/event-invitee/EventInvitee';
import EventWatch from '@entities/event-watch/EventWatch';
import Event from '@entities/event/Event';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import MemberRefresh from '@entities/member-refresh/MemberRefresh';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberValue from '@entities/member-value/MemberValue';
import Member from '@entities/member/Member';
import Payment from '@entities/payment/Payment';
import Question from '@entities/question/Question';
import RankedQuestion from '@entities/ranked-question/RankedQuestion';
import Supporter from '@entities/supporter/Supporter';
import Task from '@entities/task/Task';
import User from '@entities/user/User';
import { APP } from '@util/constants';

export default class Cache extends LRUCache<string, any> {
  constructor() {
    super({ max: 1000, maxAge: APP.CACHE_TTL });
  }

  /**
   * Invalidates all of the keys in the cache.
   *
   * @param keys - Array of keys in the cache.
   */
  invalidate(keys: string[]): void {
    if (keys) keys.forEach((key: string) => this.del(key));
  }

  /**
   * Returns true if successfully storing the key in the cache. Returns false,
   * otherwise. If the key is null or undefined, it doesn't store it in the
   * cache.
   *
   * @param key - Key to store in the cache.
   * @param value - Value to associate with the key.
   */
  set(key: string, value: any): boolean {
    if (key === null || key === undefined) return false;
    super.set(key, value);
    return true;
  }

  /**
   * Returns the entity Cache that corresponds with the appropriate entity.
   *
   * @param name - Name of the MikroORM Entity.
   */
  static getEntityCache = (name: EntityName<any>): Cache => {
    if (name === Application) return Application.cache;
    if (name === Community) return Community.cache;
    if (name === Event) return Event.cache;
    if (name === EventAttendee) return EventAttendee.cache;
    if (name === EventGuest) return EventGuest.cache;
    if (name === EventInvitee) return EventInvitee.cache;
    if (name === EventWatch) return EventWatch.cache;
    if (name === CommunityIntegrations) return CommunityIntegrations.cache;
    if (name === Member) return Member.cache;
    if (name === MemberIntegrations) return MemberIntegrations.cache;
    if (name === MemberPlan) return MemberPlan.cache;
    if (name === MemberRefresh) return MemberRefresh.cache;
    if (name === MemberSocials) return MemberSocials.cache;
    if (name === MemberValue) return MemberValue.cache;
    if (name === Payment) return Payment.cache;
    if (name === Question) return Question.cache;
    if (name === RankedQuestion) return RankedQuestion.cache;
    if (name === Supporter) return Supporter.cache;
    if (name === Task) return Task.cache;
    if (name === User) return User.cache;

    return null;
  };
}
