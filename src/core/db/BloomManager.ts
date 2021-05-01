import {
  AnyEntity,
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
  Loaded,
  New,
  Populate,
  wrap
} from '@mikro-orm/core';

import {
  BloomCreateAndFlushArgs,
  BloomFindOneOptions
} from './BloomManager.types';
import db from './db';

/**
 * Recreates some of the Entity Manager functionality in order to handle
 * functionality such as our custom built-in caching mechanism, as well as
 * other utility methods like findOneAndDelete.
 */
class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em?.fork();
  }

  async findOneOrCreate<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    data: EntityData<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<[Loaded<T, P> | T, boolean]> {
    let result: Loaded<T, P> = await this.em.findOne<T, P>(
      entityName,
      where,
      options
    );

    // If the entity was found and we have the update option set to true, then
    // we should update the found entity, but not flush it yet.
    if (result && options?.update) {
      result = wrap(result).assign(data);
    }

    return [result ?? this.create(entityName, data), !!result];
  }

  /**
   * Persists the newly created entity. Replaces the old BloomManager function
   * called createAndPersist.
   */
  create<T extends AnyEntity<T>, P extends Populate<T> = any>(
    entityName: EntityName<T>,
    data: EntityData<T>
  ): New<T, P> {
    const entity: New<T, P> = this.em.create(entityName, data);
    this.em.persist(entity);
    return entity;
  }

  /**
   * Persists the newly created entity.
   */
  async createAndFlush<T extends AnyEntity<T>, P extends Populate<T> = any>(
    entityName: EntityName<T>,
    data: EntityData<T>,
    options?: BloomCreateAndFlushArgs<P>
  ): Promise<T> {
    const entity: T = this.create(entityName, data);
    await this.em.flush();

    if (options?.populate) {
      this.em.merge(entity);
      await this.em.populate(entity, options?.populate, null, null, true);
    }

    return entity;
  }
}

export default BloomManager;
