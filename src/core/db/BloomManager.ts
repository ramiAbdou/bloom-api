import {
  AnyEntity,
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
  FindOneOptions,
  Loaded,
  New,
  Populate,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import { getEntityCache } from '../cache/Cache.util';
import {
  BloomCreateAndFlushArgs,
  BloomFindAndUpdateOptions,
  BloomFindOneAndUpdateOptions,
  BloomFindOneOptions,
  BloomFindOptions
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

  async findOne<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<Loaded<T, P>> {
    if (!where) return null;

    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const cache: Cache = getEntityCache(entityName);
    const { cacheKey } = options ?? {};

    // If we grab the entity from the cache, we need to merge it to the current
    // entity manager, as a normal findOne would do.
    if (cache.has(cacheKey)) {
      const entity = cache.get(cacheKey);
      if (entity) this.em.merge(entity, true);
      return entity as Promise<Loaded<T, P> | null>;
    }

    // If not found, get it from the DB and update the cache.
    const result: Loaded<T, P> = await this.em.findOne<T, P>(
      entityName,
      where,
      options
    );

    cache.set(cacheKey, result);

    return result;
  }

  async findOneOrFail<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const cache: Cache = getEntityCache(entityName);
    const { cacheKey } = options ?? {};

    // If we grab the entity from the cache, we need to merge it to the current
    // entity manager, as a normal findOne would do.
    if (cache.has(cacheKey)) {
      const entity = cache.get(cacheKey);
      if (entity) this.em.merge(entity);
      return entity as Promise<Loaded<T, P> | null>;
    }

    // If not found, get it from the DB.
    const result: Loaded<T, P> = await this.em.findOneOrFail<T, P>(
      entityName,
      where,
      options
    );

    // Update the cache after fetching from the DB.
    cache.set(cacheKey, result);
    return result;
  }

  async find<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    const cache: Cache = getEntityCache(entityName);

    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const { cacheKey } = options ?? {};

    // If we grab the entity from the cache, we need to merge it to the current
    // entity manager, as a normal findOne would do.
    if (cache.has(cacheKey)) {
      const result = cache.get(cacheKey);
      result.forEach((entity) => entity && this.em.merge(entity));
      return result as Promise<Loaded<T, P>[]>;
    }

    // If not found, get it from the DB.
    const result = await this.em.find<T, P>(entityName, where, options);

    // Update the cache after fetching from the DB.
    cache.set(cacheKey, result);
    return result;
  }

  async findOneOrCreate<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    data: EntityData<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<[Loaded<T, P> | T, boolean]> {
    let result: Loaded<T, P> = await this.findOne<T, P>(
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

  async findOneAndUpdate<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    data: EntityData<T>,
    options?: BloomFindOneAndUpdateOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // If not found, get it from the DB.
    const result = await this.findOne<T, P>(entityName, where, options);

    if (!result) return null;

    wrap(result).assign(data);

    await this.flush();
    return result;
  }

  async findAndUpdate<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    data: EntityData<T>,
    options?: BloomFindAndUpdateOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    // If not found, get it from the DB.
    const result = await this.find<T, P>(entityName, where, { ...options });

    result.forEach((entity: Loaded<T, P>) => {
      wrap(entity).assign(data);
    });

    await this.flush();
    return result;
  }

  /**
   * Instead of actually removing and flushing the entity(s), this function
   * acts as a SOFT DELETE and simply sets the deletedAt column within the
   * table. There is a global filter that gets all entities that have a
   * deletedAt = null.
   */
  async findOneAndDelete<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P>
  ): Promise<T> {
    // If not found, get it from the DB.
    const result = await this.findOne<T, P>(entityName, where, { ...options });
    await this.em.removeAndFlush(result);
    return result;
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
   * Flushes all changes to objects that have been queued up to now to the
   * database. This effectively synchronizes the in-memory state of managed
   * objects with the database.
   */
  async flush(): Promise<void> {
    await this.em.flush();
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
    await this.flush();

    if (options?.populate) {
      this.em.merge(entity);
      await this.em.populate(entity, options?.populate, null, null, true);
    }

    return entity;
  }
}

export default BloomManager;
