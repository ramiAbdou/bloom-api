import day from 'dayjs';
import faker from 'faker';
import { EntityData, MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

import { clearEntityCaches } from '@core/cache/Cache.util';
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

/**
 * Truncates all of the tables in the PostgreSQL database.
 *
 * @param em - Entity Manager.
 * @param entityNames - List of EntityName(s) to truncate.
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

interface InitDatabaseIntegrationTestArgs {
  beforeEach?: Function;
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
    clearEntityCaches();
    await clearAllTableData(orm.em);
    if (args?.beforeEach) await args.beforeEach();
  });

  // Closes the database connection after the tests finish.
  afterAll(async () => orm.close(true));
};

// ## BUILD TEST OBJECTS

interface BuildTestObjectArgs<T = any> {
  // Allows there to be overrides for each test object as opposed to the same
  // overrides for every test object.
  buildOverrides?: (index: number) => EntityData<T>;

  // Defaults to 1, if more then will return an array of random test object.s
  count?: number;

  // Overrides that applies to every test object.
  overrides?: EntityData<T>;
}

export const buildApplications = (
  args?: BuildTestObjectArgs<Application>
): EntityData<Application>[] => {
  const { buildOverrides = () => null, count = 1, overrides = {} } = args ?? {};

  const applications = Array.from(Array(count).keys()).map((_, i: number) => {
    return {
      description: faker.lorem.sentences(3),
      id: faker.random.uuid(),
      title: faker.random.words(3),
      ...overrides,
      ...buildOverrides(i)
    };
  });

  return applications;
};

export const buildCommunities = (
  args?: BuildTestObjectArgs<Community>
): EntityData<Community>[] => {
  const { buildOverrides = () => null, count = 1, overrides = {} } = args ?? {};

  const communities = Array.from(Array(count).keys()).map((_, i: number) => {
    return {
      id: faker.random.uuid(),
      name: faker.random.word(),
      primaryColor: faker.commerce.color(),
      urlName: faker.random.word(),
      ...overrides,
      ...buildOverrides(i)
    };
  });

  return communities;
};

export const buildCommunityIntegrations = async (
  args?: BuildTestObjectArgs<CommunityIntegrations>
): Promise<CommunityIntegrations> => {
  const { overrides = {} } = args ?? {};

  const bm: BloomManager = new BloomManager();

  return bm.createAndFlush(CommunityIntegrations, {
    community: bm.create(Community, {
      name: faker.random.word(),
      primaryColor: faker.commerce.color(),
      urlName: faker.random.word()
    }),
    ...overrides
  });
};

export const buildEvent = async (
  args?: BuildTestObjectArgs<Event>
): Promise<Event | Event[]> => {
  const { buildOverrides = () => null, count = 1, overrides = {} } = args ?? {};

  const bm: BloomManager = new BloomManager();

  const community: Community = bm.create(Community, {
    name: faker.random.word(),
    primaryColor: faker.commerce.color(),
    urlName: faker.random.word()
  });

  const events: Event[] = Array.from(Array(count).keys()).map(
    (_, i: number) => {
      return bm.create(Event, {
        community,
        description: faker.lorem.paragraph(),
        endTime: day.utc().add(26, 'hour'),
        startTime: day.utc().add(25, 'hour'),
        title: faker.lorem.words(5),
        videoUrl: faker.internet.url(),
        ...overrides,
        ...buildOverrides(i)
      });
    }
  );

  await bm.flush();

  return count >= 2 ? (events as Event[]) : (events[0] as Event);
};

export const buildMember = async (
  args?: BuildTestObjectArgs<Member>
): Promise<Member> => {
  const { overrides = {} } = args ?? {};

  const bm: BloomManager = new BloomManager();

  return bm.createAndFlush(Member, {
    ...overrides,
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    memberIntegrations: bm.create(MemberIntegrations, {}),
    user: bm.create(User, { email: faker.internet.email() })
  });
};

export const buildMemberPlan = async (
  args?: BuildTestObjectArgs<MemberPlan>
): Promise<MemberPlan | MemberPlan[]> => {
  const { buildOverrides = () => null, count = 1, overrides = {} } = args ?? {};

  const bm: BloomManager = new BloomManager();

  const memberPlans: MemberPlan[] = Array.from(Array(count).keys()).map(
    (_, i: number) => {
      return bm.create(MemberPlan, {
        amount: i * 5,
        name: faker.name.title(),
        ...overrides,
        ...buildOverrides(i)
      });
    }
  );

  await bm.flush();

  return count >= 2
    ? (memberPlans as MemberPlan[])
    : (memberPlans[0] as MemberPlan);
};
