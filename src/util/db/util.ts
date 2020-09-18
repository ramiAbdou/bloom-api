/**
 * @fileoverview Utility: PostgreSQL Database
 * @author Rami Abdou
 */

import { MikroORM } from 'mikro-orm';
import options from 'mikro-orm.config';

import { isProduction } from '../util';
import bloomManager from './bloomManager';

/**
 * Establishes the database connection to the PostgreSQL database using the
 * MikroORM package.
 */
export const createConnection = async (): Promise<MikroORM> => {
  const orm = await MikroORM.init(options);
  bloomManager.em = orm.em;
  return orm;
};

/**
 * Removes all records in the database. Helps in unit testing not to have
 * polluted data.
 */
export const cleanDBForTesting = async () => {
  if (isProduction) return;

  const orm = await createConnection();
  await orm.getSchemaGenerator().dropSchema();
  await orm.getSchemaGenerator().createSchema();
  await orm.close();
};
