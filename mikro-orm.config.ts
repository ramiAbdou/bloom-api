/**
 * @fileoverview Config: MikroORM
 * - Exports all of the database connection and initialization information.
 * @author Rami Abdou
 */

import { APP } from '@constants';
import * as entities from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import NamingStrategy from '@util/db/NamingStrategy';
import { isProduction } from '@util/util';

export default {
  clientUrl: APP.DB_URL,
  // This option disallows the usage of entitiesDirs and caching, which we set
  // to true b/c we need since BaseEntity is in a different folder than the
  // rest of the entities.
  discovery: { disableDynamicFileAccess: true },
  driverOptions: { connection: { ssl: isProduction } },
  entities: [BaseEntity, ...Object.values(entities)],
  migrations: { path: './src/db/migrations' },
  namingStrategy: NamingStrategy,
  type: 'postgresql'
};
