import {
  AnyEntity,
  EntityData,
  EntityRepository,
  FilterQuery,
  FindOneOptions,
  Loaded,
  Populate,
  QueryOrderMap
} from '@mikro-orm/core';

import { LoggerEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import logger from '@util/logger';
import { buildCacheKey, now } from '@util/util';
import cache from '../cache';

/**
 * Extends the MikroORM EntityRepository to include logging capabilities.
 */
export default class BaseRepo<T extends AnyEntity<T>> extends EntityRepository<
  T
> {
  /**
   * Returns a new BloomManager using the SAME EntityManager as the current
   * EntityRepository. It is important that is the SAME!
   */
  bm = () => new BloomManager(this.em);

  /**
   * Finds first entity matching your `where` query.
   *
   * @param key is for the cache.
   */
  async findOne<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: P | FindOneOptions<T, P>,
    orderBy?: QueryOrderMap,
    key?: string
  ): Promise<Loaded<T, P> | null> {
    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    key =
      key ??
      buildCacheKey({
        entityName: this.entityName,
        orderBy,
        populate,
        where
      });

    if (cache.has(key)) return cache.get(key) as Promise<Loaded<T, P> | null>;

    // If not found, get it from the DB.
    const result = await this.em.findOne<T, P>(
      this.entityName,
      where,
      populate as P,
      orderBy
    );

    // Update the cache after fetching from the DB.
    cache.set(key, result);
    return result;
  }

  async flush(
    event?: LoggerEvent,
    entities?: AnyEntity<any> | AnyEntity<any>[],
    invalidateCache = false
  ) {
    const entityIds: string[] = Array.isArray(entities)
      ? entities.reduce(
          (acc: string[], curr: AnyEntity<any>) => [...acc, curr],
          []
        )
      : [entities.id];

    try {
      await this.em.flush();
      if (event) logger.info(event, entityIds);
      if (invalidateCache) cache.invalidateEntries(entityIds);
    } catch (e) {
      logger.error(event, e);
      throw new Error(e);
    }
  }

  async persistAndFlush(entity: AnyEntity<any>, event?: LoggerEvent) {
    try {
      await this.em.persistAndFlush(entity);
      if (event) logger.info(event, entity.id);
      cache.invalidateEntries(entity.id);
    } catch (e) {
      logger.error(event, new Error(e));
      throw new Error(e);
    }
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

    try {
      await this.flush(event, entities);
      if (event) logger.info(event);
      cache.invalidateEntries(entities.map(({ id }) => id));
    } catch (e) {
      logger.error(event, new Error(e));
    }
  }

  /**
   * Combines the create and persist functionality.
   */
  createAndPersist(data: EntityData<T>) {
    const entity = this.create(data);
    this.persist(entity);
    return entity;
  }
}
