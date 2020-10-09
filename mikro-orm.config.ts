/**
 * @fileoverview Config: MikroORM
 * - Exports all of the database connection and initialization information.
 * @author Rami Abdou
 */

import { Connection, IDatabaseDriver, Options } from 'mikro-orm';

import { APP, isProduction } from '@constants';
import * as entities from '@entities/entities';
import BaseEntity from '@util/db/BaseEntity';
import NamingStrategy from '@util/db/NamingStrategy';
import BaseRepo from './src/util/db/BaseRepo';

const options: Options<IDatabaseDriver<Connection>> = {
  clientUrl: APP.DB_URL,
  // This option disallows the usage of entitiesDirs and caching, which we set
  // to true b/c we need since BaseEntity is in a different folder than the
  // rest of the entities.
  discovery: { disableDynamicFileAccess: true },
  driverOptions: { connection: { ssl: isProduction } },
  entities: [BaseEntity, ...Object.values(entities)],
  entityRepository: BaseRepo,
  migrations: { path: './src/db/migrations' },
  namingStrategy: NamingStrategy,
  type: 'postgresql'
};

export default options;
