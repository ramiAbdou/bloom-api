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

  async close(): Promise<void> {
    await this.em?.getConnection()?.close();
  }
}

export default new Db();
