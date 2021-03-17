import { MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

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

export const initIntegrationTest = () => {
  let orm: MikroORM<PostgreSqlDriver>;

  beforeAll(async () => {
    orm = await db.createConnection();
  });

  beforeEach(async () => clearAllTableData(orm.em));
  afterAll(async () => orm.close(true));
};
