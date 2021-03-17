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
import { getEntityCache } from './Cache.util';

const cache: Cache = new Cache();

beforeEach(() => {
  cache.reset();
});

test('cache.invalidate()', () => {
  cache.set('GET_COMMUNITY', { id: '1' });
  cache.set('GET_MEMBER', { id: '1' });
  cache.set('GET_USER', { id: '1' });
  cache.invalidate(['GET_COMMUNITY', 'GET_USER']);
  expect(cache.has('GET_COMMUNITY')).toBe(false);
  expect(cache.has('GET_MEMBER')).toBe(true);
  expect(cache.has('GET_USER')).toBe(false);
});

test('cache.set() - Key is not defined.', () => {
  const actualOutput = cache.set(null, { id: '1' });
  expect(cache.has(null)).toBe(false);
  expect(actualOutput).toBe(false);
});

test('cache.set() - Key is defined.', () => {
  const actualOutput = cache.set('GET_COMMUNITY', { id: '1' });
  expect(cache.has('GET_COMMUNITY')).toBe(true);
  expect(actualOutput).toBe(true);
});

test('getEntityCache()', () => {
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
  expect(getEntityCache(MemberIntegrations)).toEqual(MemberIntegrations.cache);
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
