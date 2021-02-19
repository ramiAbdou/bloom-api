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

import cache from '@core/db/cache';
import { FlushEvent } from '@util/events';
import logger from '@util/logger';
import { now } from '@util/util';
import {
  BloomCreateAndFlushArgs,
  BloomFindAndDeleteOptions,
  BloomFindAndUpdateOptions,
  BloomFindOneAndUpdateOptions,
  BloomFindOneOptions,
  BloomFindOptions
} from './BloomManager.types';
import db from './db';

/**
 * Recreates some of the Entity Manager functionality in order to handle
 * functionality such as our custom built-in caching mechanism, as well as
 * other utility methods like deleteAndPersist, which only mark an entity
 * as deleted, instead of actually deleting it.
 */
class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em.fork();
  }

  fork = () => new BloomManager();

  async flush?(event?: FlushEvent) {
    try {
      logger.log({ contextId: this.em.id, event, level: 'BEFORE_FLUSH' });
      await this.em.flush();
      logger.log({ contextId: this.em.id, event, level: 'FLUSH_SUCCESS' });
    } catch (e) {
      logger.log({
        contextId: this.em.id,
        error: e.stack,
        event,
        level: 'FLUSH_ERROR'
      });

      throw e;
    }
  }

  async findOne<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const { cacheKey } = options ?? {};

    // If we grab the entity from the cache, we need to merge it to the current
    // entity manager, as a normal findOne would do.
    if (options?.cache !== false && cache.has(cacheKey)) {
      const entity = cache.get(cacheKey);
      if (entity) this.em.merge(entity, true);
      return entity as Promise<Loaded<T, P> | null>;
    }

    // If not found, get it from the DB.
    const result = await this.em.findOne<T, P>(entityName, where, options);

    // Update the cache after fetching from the DB.
    if (options?.cache !== false) cache.set(cacheKey, result);
    return result;
  }

  async findOneOrFail<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const { cacheKey } = options ?? {};

    // If we grab the entity from the cache, we need to merge it to the current
    // entity manager, as a normal findOne would do.
    if (cache.has(cacheKey)) {
      const entity = cache.get(cacheKey);
      if (entity) this.em.merge(entity);
      return entity as Promise<Loaded<T, P> | null>;
    }

    // If not found, get it from the DB.
    const result = await this.em.findOneOrFail<T, P>(
      entityName,
      where,
      options
    );

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
    const result = await this.findOne<T, P>(entityName, where, options);
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

    await this.flush(options?.event);
    return result;
  }

  async find<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
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

    await this.flush(options?.event);
    return result;
  }

  async findAndRestore<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindAndUpdateOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    // If not found, get it from the DB.
    const result = await this.find<T, P>(entityName, where, {
      ...options,
      filters: false
    });

    result.forEach((entity: Loaded<T, P>) => {
      // @ts-ignore b/c deletedAt isn't detected.
      entity.deletedAt = null;
    });

    await this.flush(options?.event);
    return result;
  }

  /**
   * Instead of actually removing and flushing the entity(s), this function
   * acts as a SOFT DELETE and simply sets the deletedAt column within the
   * table. There is a global filter that gets all entities that have a
   * deletedAt = null.
   */
  async findAndDelete<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindAndDeleteOptions<T, P>
  ): Promise<T[]> {
    // If not found, get it from the DB.
    const result = await this.find<T, P>(entityName, where, options);

    const updatedResult = result.map((entity: Loaded<T, P>) => {
      // @ts-ignore b/c not sure the right type for this.
      entity.deletedAt = now();
      return entity;
    });

    if (!options?.soft) this.em.remove(result);

    await this.flush(options?.event);
    return updatedResult;
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
    options?: BloomFindAndDeleteOptions<T, P>
  ): Promise<T> {
    // If not found, get it from the DB.
    const result = await this.findOne<T, P>(entityName, where, { ...options });

    // @ts-ignore b/c type checking.
    result.deletedAt = now();
    if (!options?.soft) this.em.remove(result);

    await this.flush(options?.event);
    return result;
  }

  async findOneAndRestore<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindAndUpdateOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // If not found, get it from the DB.
    const result = await this.findOne<T, P>(entityName, where, {
      ...options,
      filters: false
    });

    // @ts-ignore b/c deletedAt isn't detected.
    result.deletedAt = null;

    await this.flush(options?.event);
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
   * Persists the newly created entity. Replaces the old BloomManager function
   * called createAndPersist.
   */
  async createAndFlush<T extends AnyEntity<T>, P extends Populate<T> = any>(
    entityName: EntityName<T>,
    data: EntityData<T>,
    { populate, ...options }: BloomCreateAndFlushArgs<P>
  ): Promise<T> {
    const entity = this.create(entityName, data);
    await this.flush(options?.event);

    if (populate) {
      this.em.merge(entity);
      await this.em.populate(entity, populate, null, null, true);
    }

    return entity;
  }
}

export default BloomManager;
