import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';

import { APP, isProduction } from '@constants';
import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import BaseEntity from '@core/db/BaseEntity';
import BloomManagerSubscriber from '@core/db/BloomManager.subscriber';
import NamingStrategy from '@core/db/NamingStrategy';
import CommunityApplicationSubscriber from '@entities/community-application/CommunityApplication.subscriber';
import CommunityIntegrationsSubscriber from '@entities/community-integrations/CommunityIntegrations.subscriber';
import CommunitySubscriber from '@entities/community/Community.subscriber';
import * as entities from '@entities/entities';
import EventAttendeeSubscriber from '@entities/event-attendee/EventAttendee.subscriber';
import EventGuestSubscriber from '@entities/event-guest/EventGuest.subscriber';
import EventWatchSubscriber from '@entities/event-watch/EventWatch.subscriber';
import EventSubscriber from '@entities/event/Event.subscriber';
import MemberDataSubscriber from '@entities/member-data/MemberData.subscriber';
import MemberPaymentSubscriber from '@entities/member-payment/MemberPayment.subscriber';
import MemberTypeSubscriber from '@entities/member-type/MemberType.subscriber';
import MemberSubscriber from '@entities/member/Member.subscriber';
import QuestionSubscriber from '@entities/question/Question.subscriber';
import UserSubscriber from '@entities/user/User.subscriber';

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
  entities: [BaseEntity, BaseCompositeEntity, ...Object.values(entities)],
  filters: { notDeleted: { args: false, cond: { deletedAt: null } } },
  namingStrategy: NamingStrategy,
  subscribers: [
    new BloomManagerSubscriber(),
    new CommunityApplicationSubscriber(),
    new CommunityIntegrationsSubscriber(),
    new CommunitySubscriber(),
    new EventAttendeeSubscriber(),
    new EventGuestSubscriber(),
    new EventWatchSubscriber(),
    new EventSubscriber(),
    new MemberDataSubscriber(),
    new MemberPaymentSubscriber(),
    new MemberTypeSubscriber(),
    new MemberSubscriber(),
    new QuestionSubscriber(),
    new UserSubscriber()
  ],
  type: 'postgresql'
};

export default dbConfig;
