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
import Cache from './Cache';

/**
 * Returns the entity Cache that corresponds with the appropriate entity.
 *
 * @param name - Name of the MikroORM Entity.
 */
export const getEntityCache = (name: EntityName<any>): Cache => {
  if (name === Application) return Application.cache;
  if (name === Community) return Community.cache;
  if (name === CommunityIntegrations) return CommunityIntegrations.cache;
  if (name === Event) return Event.cache;
  if (name === EventAttendee) return EventAttendee.cache;
  if (name === EventGuest) return EventGuest.cache;
  if (name === EventInvitee) return EventInvitee.cache;
  if (name === EventWatch) return EventWatch.cache;
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

/**
 * Returns all the entity Cache(s) that correspond with the appropriate entity.
 */
export const getAllEntityCaches = (): Cache[] => {
  return [
    Application.cache,
    Community.cache,
    CommunityIntegrations.cache,
    Event.cache,
    EventAttendee.cache,
    EventGuest.cache,
    EventInvitee.cache,
    EventWatch.cache,
    Member.cache,
    MemberIntegrations.cache,
    MemberPlan.cache,
    MemberRefresh.cache,
    MemberSocials.cache,
    MemberValue.cache,
    Payment.cache,
    Question.cache,
    RankedQuestion.cache,
    Supporter.cache,
    Task.cache,
    User.cache
  ];
};

/**
 * Clears the entity caches. If no entityName(s) are supplied, will clear every
 * entity cache.
 *
 * @param entityNames - List of EntityName(s) to clear caches for.
 */
export const clearEntityCaches = (entityNames?: EntityName<any>[]) => {
  if (entityNames) {
    entityNames.forEach(async (entityName: EntityName<any>) => {
      const cache = getEntityCache(entityName);
      if (cache) cache.reset();
    });

    return;
  }

  getAllEntityCaches().forEach((cache) => cache.reset());
};
