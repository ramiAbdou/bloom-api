import { EntityManager, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

import { isDevelopment } from '@util/constants';
import dbConfig from '../../../mikro-orm.config';

class Db {
  em: EntityManager;

  /**
   * Establishes a database connection and sets the connection's EntityManager
   * and returns the ORM.
   */
  async createConnection(): Promise<MikroORM<PostgreSqlDriver>> {
    const orm = (await MikroORM.init(dbConfig)) as MikroORM<PostgreSqlDriver>;

    // Create the database schema if it doesn't already exist.
    await orm.getSchemaGenerator().createSchema();
    this.em = orm.em;
    return orm;
  }

  /**
   * Removes all records in the database. Helps in unit testing not to have
   * polluted data. Anywhere this is used, don't forget to close the connection!
   */
  async cleanForTesting(): Promise<void> {
    if (!isDevelopment) return;

    const orm = await this.createConnection();
    await orm.getSchemaGenerator().dropSchema();
    await orm.getSchemaGenerator().createSchema();
  }

  async close(): Promise<void> {
    await this.em?.getConnection()?.close();
  }

  // async truncateTables(): Promise<void> {

  // }
}

export default new Db();
