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
import {
  clearEntityCaches,
  getAllEntityCaches,
  getEntityCache
} from './Cache.util';

describe('clearEntityCaches()', () => {
  test('If no entityName(s) are supplied, should clear all entity Cache(s).', () => {
    getAllEntityCaches().forEach((cache) => cache.set('a', 'b'));
    clearEntityCaches();
    getAllEntityCaches().forEach((cache) => expect(cache.length).toBe(0));
  });
});

describe('getEntityCache()', () => {
  test('Should return the corresponding entity Cache.', () => {
    expect(getEntityCache(Application)).toEqual(Application.cache);
    expect(getEntityCache(Community)).toEqual(Community.cache);

    expect(getEntityCache(CommunityIntegrations)).toEqual(
      CommunityIntegrations.cache
    );

    expect(getEntityCache(Event)).toEqual(Event.cache);
    expect(getEntityCache(EventAttendee)).toEqual(EventAttendee.cache);
    expect(getEntityCache(EventGuest)).toEqual(EventGuest.cache);
    expect(getEntityCache(EventInvitee)).toEqual(EventInvitee.cache);
    expect(getEntityCache(EventWatch)).toEqual(EventWatch.cache);
    expect(getEntityCache(Member)).toEqual(Member.cache);

    expect(getEntityCache(MemberIntegrations)).toEqual(
      MemberIntegrations.cache
    );

    expect(getEntityCache(MemberPlan)).toEqual(MemberPlan.cache);
    expect(getEntityCache(MemberRefresh)).toEqual(MemberRefresh.cache);
    expect(getEntityCache(MemberSocials)).toEqual(MemberSocials.cache);
    expect(getEntityCache(MemberValue)).toEqual(MemberValue.cache);
    expect(getEntityCache(Payment)).toEqual(Payment.cache);
    expect(getEntityCache(Question)).toEqual(Question.cache);
    expect(getEntityCache(RankedQuestion)).toEqual(RankedQuestion.cache);
    expect(getEntityCache(Supporter)).toEqual(Supporter.cache);
    expect(getEntityCache(Task)).toEqual(Task.cache);
    expect(getEntityCache(User)).toEqual(User.cache);
    expect(getEntityCache(null)).toBe(null);
  });
});
