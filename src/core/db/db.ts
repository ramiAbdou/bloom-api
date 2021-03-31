import { EntityManager, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

import dbConfig from '../../../mikro-orm.config';

class Db {
  em: EntityManager;

  /**
   * Establishes a database connection and sets the connection's EntityManager
   * and returns the ORM.
   */
  async createConnection(): Promise<MikroORM<PostgreSqlDriver>> {
    const orm = (await MikroORM.init(dbConfig)) as MikroORM<PostgreSqlDriver>;
    this.em = orm.em;
    return orm;
  }

  /**
   * Removes all records in the database. Helps in unit testing not to have
   * polluted data. Anywhere this is used, don't forget to close the connection!
   */
  async clean(): Promise<void> {
    if (process.env.APP_ENV !== 'dev' && process.env.NODE_ENV !== 'test') {
      return;
    }

    const orm = await this.createConnection();
    await orm.getSchemaGenerator().dropSchema();
    await orm.getSchemaGenerator().createSchema();
    await orm.getMigrator().up();
  }

  async close(): Promise<void> {
    await this.em?.getConnection()?.close();
  }
}

export default new Db();
