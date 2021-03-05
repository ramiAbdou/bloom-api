import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import BloomManagerSubscriber from '@core/db/BloomManager.subscriber';
import NamingStrategy from '@core/db/NamingStrategy';
import ApplicationQuestion from '@entities/application-question/ApplicationQuestion';
import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import EventInvitee from '@entities/event-invitee/EventInvitee';
import EventWatch from '@entities/event-watch/EventWatch';
import Event from '@entities/event/Event';
import MemberPlan from '@entities/member-plan/MemberPlan';
import MemberRefresh from '@entities/member-refresh/MemberRefresh';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberSocialsSubscriber from '@entities/member-socials/MemberSocials.subscriber';
import MemberValue from '@entities/member-value/MemberValue';
import Member from '@entities/member/Member';
import MemberSubscriber from '@entities/member/Member.subscriber';
import Payment from '@entities/payment/Payment';
import Question from '@entities/question/Question';
import Supporter from '@entities/supporter/Supporter';
import Task from '@entities/task/Task';
import User from '@entities/user/User';
import { APP, isProduction } from '@util/constants';

/**
 * Exports all of the database connection and initialization information.
 */
const dbConfig: Options<IDatabaseDriver<Connection>> = {
  clientUrl: APP.DB_URL,
  // This option disallows the usage of entitiesDirs and caching, which we set
  // to true b/c we need since BaseEntity is in a different folder than the
  // rest of the entities.
  discovery: { disableDynamicFileAccess: true },
  driverOptions: { connection: { ssl: isProduction } },
  entities: [
    BaseEntity,
    Application,
    ApplicationQuestion,
    CommunityIntegrations,
    Community,
    Event,
    EventAttendee,
    EventGuest,
    EventInvitee,
    EventWatch,
    Payment,
    MemberRefresh,
    MemberSocials,
    MemberPlan,
    MemberValue,
    Member,
    Question,
    Supporter,
    Task,
    User
  ],
  filters: { notDeleted: { args: false, cond: { deletedAt: null } } },
  namingStrategy: NamingStrategy,
  subscribers: [
    new BloomManagerSubscriber(),
    new MemberSubscriber(),
    new MemberSocialsSubscriber()
  ],
  type: 'postgresql'
};

export default dbConfig;
