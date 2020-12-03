import options from 'mikro-orm.config';
import { EntityManager, MikroORM } from '@mikro-orm/core';

import { isProduction } from '../constants';

class Connection {
  em: EntityManager;

  /**
   * Establishes a database connection and sets the connection's EntityManager
   * and returns the ORM.
   */
  createConnection = async (): Promise<MikroORM> => {
    const orm = await MikroORM.init(options);
    this.em = orm.em;
    return orm;
  };

  /**
   * Removes all records in the database. Helps in unit testing not to have
   * polluted data. Anywhere this is used, don't forget to close the connection!
   */
  cleanForTesting = async (): Promise<void> => {
    if (isProduction) return;
    const orm = await this.createConnection();
    await orm.getSchemaGenerator().dropSchema();
    await orm.getSchemaGenerator().createSchema();
  };

  close = async (): Promise<void> => this.em?.getConnection()?.close();
}

export default new Connection();
