import {
  AnyEntity,
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  Loaded,
  New,
  Populate
} from '@mikro-orm/core';

import { LoggerEvent } from '@constants';
import logger from '@util/logger';
import { buildCacheKey, now } from '@util/util';
import cache from '../cache';
import db from './db';

interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

interface BloomFindOptions<T, P> extends FindOptions<T, P> {
  cacheKey?: string;
}

/**
 * Recreates some of the Entity Manager functionality in order to handle
 * functionality such as our custom built-in caching mechanism, as well as
 * other utility methods like deleteAndPersist, which only mark an entity
 * as deleted, instead of actually deleting it.
 */
export default class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em.fork();
  }

  fork = () => new BloomManager();

  async flush(event: LoggerEvent) {
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
    const key = cacheKey ?? buildCacheKey({ entityName, where, ...options });

    if (cache.has(key)) {
      const entity = cache.get(key);
      // this.em.merge(entity);
      return entity as Promise<Loaded<T, P> | null>;
    }

    // If not found, get it from the DB.
    const result = await this.em.findOne<T, P>(entityName, where, {
      ...options
    });

    // Update the cache after fetching from the DB.
    cache.set(key, result);
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
    const key = cacheKey ?? buildCacheKey({ entityName, where, ...options });
    if (cache.has(key)) {
      const result = cache.get(key);
      // this.em.merge(result);
      return result as Promise<Loaded<T, P>[]>;
    }

    // If not found, get it from the DB.
    const result = await this.em.find<T, P>(entityName, where, { ...options });

    // Update the cache after fetching from the DB.
    cache.set(key, result);
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
   * Instead of actually removing and flushing the entity(s), this function
   * acts as a SOFT DELETE and simply sets the deletedAt column within the
   * table. There is a global filter that gets all entities that have a
   * deletedAt = null.
   */
  async deleteAndFlush(
    entities?: AnyEntity<any> | AnyEntity<any>[],
    event?: LoggerEvent
  ) {
    if (Array.isArray(entities)) {
      entities.forEach((entity: AnyEntity<any>) => {
        entity.deletedAt = now();
      });
    } else entities.deletedAt = now();

    await this.flush(event);
  }
}
