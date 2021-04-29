import day from 'dayjs';
import * as Factory from 'factory.ts';
import faker from 'faker';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

import db from '@core/db/db';
import Application from '@entities/application/Application';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import EventWatch from '@entities/event-watch/EventWatch';
import Event from '@entities/event/Event';
import MemberRefresh from '@entities/member-refresh/MemberRefresh';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberType from '@entities/member-type/MemberType';
import MemberValue from '@entities/member-value/MemberValue';
import Member from '@entities/member/Member';
import Question, { QuestionType } from '@entities/question/Question';
import RankedQuestion from '@entities/ranked-question/RankedQuestion';
import Supporter from '@entities/supporter/Supporter';
import Task from '@entities/task/Task';
import User from '@entities/user/User';

/**
 * Truncates all of the tables in the PostgreSQL database.
 *
 * @param em - Entity Manager.
 * @param entityNames - List of EntityName(s) to truncate.
 */
export const clearAllTableData = async (em: EntityManager): Promise<void> => {
  await em.createQueryBuilder(Application).truncate().execute();
  await em.createQueryBuilder(Community).truncate().execute();
  await em.createQueryBuilder(EventAttendee).truncate().execute();
  await em.createQueryBuilder(EventGuest).truncate().execute();
  await em.createQueryBuilder(EventWatch).truncate().execute();
  await em.createQueryBuilder(Event).truncate().execute();
  await em.createQueryBuilder(MemberRefresh).truncate().execute();
  await em.createQueryBuilder(MemberSocials).truncate().execute();
  await em.createQueryBuilder(MemberType).truncate().execute();
  await em.createQueryBuilder(MemberValue).truncate().execute();
  await em.createQueryBuilder(Member).truncate().execute();
  await em.createQueryBuilder(Question).truncate().execute();
  await em.createQueryBuilder(RankedQuestion).truncate().execute();
  await em.createQueryBuilder(Supporter).truncate().execute();
  await em.createQueryBuilder(Task).truncate().execute();
  await em.createQueryBuilder(User).truncate().execute();

  em.clear();
};

interface InitDatabaseIntegrationTestArgs {
  beforeEach?: () => Promise<void>;
}

/**
 * Initializes an integration by calling the pre- and post- Jest hooks,
 * including beforeAll, beforeEach and afterAll.
 *
 * Handles database interactions.
 */
export const initDatabaseIntegrationTest = (
  args?: InitDatabaseIntegrationTestArgs
): void => {
  let orm: MikroORM<PostgreSqlDriver>;

  beforeAll(async () => {
    // Establishes the database connection.
    orm = await db.createConnection();
  });

  // Removes all of the table data and clears the caches.
  beforeEach(async () => {
    await clearAllTableData(orm.em);
    if (args?.beforeEach) await args.beforeEach();
  });

  // Closes the database connection after the tests finish.
  afterAll(async () => orm.close(true));
};

export const applicationFactory = Factory.Sync.makeFactory<
  Partial<Application>
>({
  description: faker.lorem.sentences(3),
  title: faker.random.words(3)
});

export const communityFactory = Factory.Sync.makeFactory<Partial<Community>>({
  name: faker.random.word(),
  primaryColor: faker.commerce.color(),
  urlName: faker.random.word()
});

export const eventFactory = Factory.Sync.makeFactory<Partial<Event>>({
  description: faker.lorem.paragraph(),
  endTime: Factory.each((i: number) => {
    if (i % 2 === 1) return day.utc().add(26, 'hour').format();
    return day.utc().subtract(25, 'hour').format();
  }),
  startTime: Factory.each((i: number) => {
    if (i % 2 === 1) return day.utc().add(25, 'hour').format();
    return day.utc().subtract(26, 'hour').format();
  }),
  title: faker.lorem.words(5),
  videoUrl: faker.internet.url()
});

export const memberFactory = Factory.Sync.makeFactory<Partial<Member>>({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName()
});

export const memberTypeFactory = Factory.Sync.makeFactory<Partial<MemberType>>({
  amount: Factory.each((i: number) => i * 5),
  name: faker.name.title()
});

export const questionFactory = Factory.Sync.makeFactory<Partial<Question>>({
  description: faker.random.words(10),
  rank: Factory.each((i: number) => i * 100),
  title: faker.random.words(5),
  type: QuestionType.SHORT_TEXT
});

export const userFactory = Factory.Sync.makeFactory<Partial<User>>({
  email: faker.internet.email()
});
