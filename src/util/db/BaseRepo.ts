/**
 * @fileoverview Utility: BaseRepo
 * - Extends the MikroORM EntityRepository to include logging capabilities.
 * @author Rami Abdou
 */

import { AnyEntity, EntityRepository } from 'mikro-orm';

import { LoggerEvent } from '@constants';
import {
  Community,
  Event,
  EventAttendee,
  EventRSVP,
  Membership,
  User
} from '@entities';
import logger from '@logger';
import { now } from '@util/util';

export default class BaseRepo<T extends AnyEntity<T>> extends EntityRepository<
  T
> {
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

  async deleteAndFlush(
    entities?: AnyEntity<any> | AnyEntity<any>[],
    event?: LoggerEvent
  ) {
    if (Array.isArray(entities))
      entities.forEach((entity: AnyEntity<any>) => {
        entity.deletedAt = now();
      });
    else entities.deletedAt = now();

    try {
      await this.flush(event, entities);
      if (event) logger.info(event);
    } catch (e) {
      logger.error(event, new Error(e));
    }
  }

  /**
   * REPOSITORIES - Exports all of the entity repositories. They are already
   * type-casted (defined in the entity definition itself).
   */

  communityRepo = () => this.em.getRepository(Community);

  eventRepo = () => this.em.getRepository(Event);

  eventAttendeeRepo = () => this.em.getRepository(EventAttendee);

  eventRSVPRepo = () => this.em.getRepository(EventRSVP);

  membershipRepo = () => this.em.getRepository(Membership);

  userRepo = () => this.em.getRepository(User);
}
