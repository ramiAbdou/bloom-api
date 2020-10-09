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

export default class BaseRepo<T extends AnyEntity<T>> extends EntityRepository<
  T
> {
  async flush(event?: LoggerEvent, entity?: AnyEntity<any>) {
    try {
      await this.em.flush();
      if (event) logger.info(event, entity.id);
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

  async removeAndFlush(entity: AnyEntity<any>, event?: LoggerEvent) {
    try {
      await this.em.removeAndFlush(entity);
      if (event) logger.info(event, entity.id);
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
