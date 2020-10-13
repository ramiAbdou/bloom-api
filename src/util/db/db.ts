/**
 * @fileoverview Utility: Connection
 * @author Rami Abdou
 */

import { EntityManager, MikroORM } from 'mikro-orm';
import options from 'mikro-orm.config';

import { isProduction } from '../constants';

class Connection {
  em: EntityManager;

  /**
   * Establishes a database connection and sets the connection's EntityManager
   * and returns the ORM.
   */
  async createConnection(): Promise<MikroORM> {
    const orm = await MikroORM.init(options);
    this.em = orm.em;
    return orm;
  }

  /**
   * Removes all records in the database. Helps in unit testing not to have
   * polluted data.
   */
  async cleanForTesting(): Promise<void> {
    if (isProduction) return;
    const orm = await this.createConnection();
    await orm.getSchemaGenerator().dropSchema();
    await orm.getSchemaGenerator().createSchema();
    await orm.close();
  }
}

export default new Connection();
