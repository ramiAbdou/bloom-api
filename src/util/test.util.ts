import faker from 'faker';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

import BloomManager from '@core/db/BloomManager';
import db from '@core/db/db';
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

export const buildApplication = async () => {
  const bm = new BloomManager();

  return bm.createAndFlush(Application, {
    community: bm.create(Community, {
      name: faker.random.word(),
      primaryColor: faker.commerce.color(),
      urlName: faker.random.word()
    }),
    description: faker.lorem.sentences(3),
    title: faker.random.words(3)
  });
};

/**
 * Truncates all of the tables in the PostgreSQL database.
 *
 * @param em - Entity Manager.
 */
export const clearAllTableData = async (em: EntityManager): Promise<void> => {
  await em.createQueryBuilder(Application).truncate().execute();
  await em.createQueryBuilder(CommunityIntegrations).truncate().execute();
  await em.createQueryBuilder(Community).truncate().execute();
  await em.createQueryBuilder(EventAttendee).truncate().execute();
  await em.createQueryBuilder(EventGuest).truncate().execute();
  await em.createQueryBuilder(EventInvitee).truncate().execute();
  await em.createQueryBuilder(EventWatch).truncate().execute();
  await em.createQueryBuilder(Event).truncate().execute();
  await em.createQueryBuilder(MemberIntegrations).truncate().execute();
  await em.createQueryBuilder(MemberPlan).truncate().execute();
  await em.createQueryBuilder(MemberRefresh).truncate().execute();
  await em.createQueryBuilder(MemberSocials).truncate().execute();
  await em.createQueryBuilder(MemberValue).truncate().execute();
  await em.createQueryBuilder(Member).truncate().execute();
  await em.createQueryBuilder(Payment).truncate().execute();
  await em.createQueryBuilder(Question).truncate().execute();
  await em.createQueryBuilder(RankedQuestion).truncate().execute();
  await em.createQueryBuilder(Supporter).truncate().execute();
  await em.createQueryBuilder(Task).truncate().execute();
  await em.createQueryBuilder(User).truncate().execute();
  em.clear();
};

/**
 * Initializes an integration by calling the pre- and post- Jest hooks,
 * including beforeAll, beforeEach and afterAll.
 *
 * Handles database interactions.
 */
export const initIntegrationTest = async (): Promise<void> => {
  let orm: MikroORM<PostgreSqlDriver>;

  beforeAll(async () => {
    // Establishes the database connection.
    orm = await db.createConnection();
  });

  // Removes all of the table data.
  beforeEach(async () => clearAllTableData(orm.em));

  // Closes the database connection after the tests finish.
  afterAll(async () => orm.close(true));
};
