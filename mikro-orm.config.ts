import {
  Connection,
  IDatabaseDriver,
  MigrationsOptions,
  Options
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import NamingStrategy from '@core/db/NamingStrategy';
import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import EventInvitee from '@entities/event-invitee/EventInvitee';
import EventWatch from '@entities/event-watch/EventWatch';
import Event from '@entities/event/Event';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import MemberRefresh from '@entities/member-refresh/MemberRefresh';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberType from '@entities/member-type/MemberType';
import MemberValue from '@entities/member-value/MemberValue';
import Member from '@entities/member/Member';
import Payment from '@entities/payment/Payment';
import Question from '@entities/question/Question';
import RankedQuestion from '@entities/ranked-question/RankedQuestion';
import Supporter from '@entities/supporter/Supporter';
import Task from '@entities/task/Task';
import User from '@entities/user/User';

const migrationsOptions: MigrationsOptions = {
  allOrNothing: true,
  disableForeignKeys: false,
  dropTables: true,
  emit: 'ts',
  path: './migrations',
  safe: false,
  tableName: 'migrations',
  transactional: true
};

/**
 * Exports all of the database connection and initialization information.
 */
const dbConfig: Options<IDatabaseDriver<Connection>> = {
  dbName:
    process.env.NODE_ENV === 'test'
      ? `${process.env.DB_NAME}-test`
      : process.env.DB_NAME,
  // This option disallows the usage of entitiesDirs and caching, which we set
  // to true b/c we need since BaseEntity is in a different folder than the
  // rest of the entities.
  discovery: { disableDynamicFileAccess: true },
  driverOptions: { connection: { ssl: process.env.APP_ENV !== 'dev' } },
  entities: [
    BaseEntity,
    Application,
    RankedQuestion,
    CommunityIntegrations,
    Community,
    Event,
    EventAttendee,
    EventGuest,
    EventInvitee,
    EventWatch,
    Payment,
    MemberIntegrations,
    MemberRefresh,
    MemberSocials,
    MemberType,
    MemberValue,
    Member,
    Question,
    Supporter,
    Task,
    User
  ],
  filters: { notDeleted: { args: false, cond: { deletedAt: null } } },
  host: process.env.DB_HOST,
  migrations: migrationsOptions,
  namingStrategy: NamingStrategy,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  type: 'postgresql',
  user: process.env.DB_USER
};

export default dbConfig;
