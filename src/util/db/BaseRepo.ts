/**
 * @fileoverview Utility: BaseRepo
 * - Extends the MikroORM EntityRepository to include logging capabilities.
 * @author Rami Abdou
 */

import { AnyEntity, EntityData, EntityRepository } from 'mikro-orm';

import { LoggerEvent } from '@constants';
import logger from '@logger';
import BloomManager from '@util/db/BloomManager';
import { now } from '@util/util';

export default class BaseRepo<T extends AnyEntity<T>> extends EntityRepository<
  T
> {
  /**
   * Returns a new BloomManager using the same EntityManager as the current
   * EntityRepository.
   */
  bm() {
    return new BloomManager(this.em);
  }

  async flush(
    event?: LoggerEvent,
    entities?: AnyEntity<any> | AnyEntity<any>[]
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
    } catch (e) {
      logger.error(event, new Error(e));
    }
  }

  async persistAndFlush(entity: AnyEntity<any>, event?: LoggerEvent) {
    try {
      await this.em.persistAndFlush(entity);
      if (event) logger.info(event, entity.id);
    } catch (e) {
      logger.error(event, new Error(e));
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
