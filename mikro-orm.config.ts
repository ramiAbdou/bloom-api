// eslint-disable-next-line simple-import-sort/sort
import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';

import { APP, isProduction } from '@constants';
import * as entities from '@entities/entities';
import BaseEntity from '@core/db/BaseEntity';
import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import BloomSubscriber from '@core/db/BloomSubscriber';
import NamingStrategy from '@core/db/NamingStrategy';
import UserSubscriber from '@entities/user/User.subscriber';

/**
 * Exports all of the database connection and initialization information.
 */
export default {
  clientUrl: APP.DB_URL,
  // This option disallows the usage of entitiesDirs and caching, which we set
  // to true b/c we need since BaseEntity is in a different folder than the
  // rest of the entities.
  discovery: { disableDynamicFileAccess: true },
  driverOptions: { connection: { ssl: isProduction } },
  entities: [BaseEntity, BaseCompositeEntity, ...Object.values(entities)],
  filters: { notDeleted: { args: false, cond: { deletedAt: null } } },
  namingStrategy: NamingStrategy,
  subscribers: [new BloomSubscriber(), new UserSubscriber()],
  type: 'postgresql'
} as Options<IDatabaseDriver<Connection>>;
