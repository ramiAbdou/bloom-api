import { EntityName } from '@mikro-orm/core';

import Application from '@entities/application/Application';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import EventInvitee from '@entities/event-invitee/EventInvitee';
import EventWatch from '@entities/event-watch/EventWatch';
import Event from '@entities/event/Event';
import Integrations from '@entities/integrations/Integrations';
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
import { Cache } from './cache';

/**
 * Returns the Cache that corresponds with the appropriate entity.
 *
 * @param entityName - Name of the Entity.
 */
export const getEntityCache = (entityName: EntityName<any>): Cache => {
  if (entityName === Application) return Application.cache;
  if (entityName === Community) return Community.cache;
  if (entityName === Event) return Event.cache;
  if (entityName === EventAttendee) return EventAttendee.cache;
  if (entityName === EventGuest) return EventGuest.cache;
  if (entityName === EventInvitee) return EventInvitee.cache;
  if (entityName === EventWatch) return EventWatch.cache;
  if (entityName === Integrations) return Integrations.cache;
  if (entityName === Member) return Member.cache;
  if (entityName === MemberIntegrations) return MemberIntegrations.cache;
  if (entityName === MemberPlan) return MemberPlan.cache;
  if (entityName === MemberRefresh) return MemberRefresh.cache;
  if (entityName === MemberSocials) return MemberSocials.cache;
  if (entityName === MemberValue) return MemberValue.cache;
  if (entityName === Payment) return Payment.cache;
  if (entityName === Question) return Question.cache;
  if (entityName === RankedQuestion) return RankedQuestion.cache;
  if (entityName === Supporter) return Supporter.cache;
  if (entityName === Task) return Task.cache;
  if (entityName === User) return User.cache;
  return null;
};

/**
 * Returns all entity Caches.
 */
export const getAllEntityCaches = (): Cache[] => {
  return [
    Application.cache,
    Community.cache,
    Event.cache,
    EventAttendee.cache,
    EventGuest.cache,
    EventInvitee.cache,
    EventWatch.cache,
    Integrations.cache,
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
