import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';

import { APP, isProduction } from '@constants';
import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import BaseEntity from '@core/db/BaseEntity';
import BloomManagerSubscriber from '@core/db/BloomManager.subscriber';
import NamingStrategy from '@core/db/NamingStrategy';
import * as entities from '@entities/entities';
import * as subscribers from '@entities/subscribers';

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
  subscribers: [
    new BloomManagerSubscriber(),
    ...Object.values(subscribers).map((Subscriber) => new Subscriber())
  ],
  type: 'postgresql'
} as Options<IDatabaseDriver<Connection>>;
