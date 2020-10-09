/**
 * @fileoverview Utility: BaseRepo
 * - Extends the MikroORM EntityRepository to include logging capabilities.
 * @author Rami Abdou
 */

import { AnyEntity, EntityRepository } from 'mikro-orm';

import {
  Community,
  Event,
  EventAttendee,
  EventRSVP,
  Membership,
  User
} from '@entities/entities';
import logger from '@logger';

export default class BaseRepo<T extends AnyEntity<T>> extends EntityRepository<
  T
> {
  async flush(message?: string, data?: Record<string, any>) {
    try {
      await this.em.flush();
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
    }
  }

  async persistAndFlush(
    entities: AnyEntity<any> | AnyEntity<any>[],
    message?: string,
    data?: Record<string, any>
  ) {
    try {
      await this.em.persistAndFlush(entities);
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
    }
  }

  async removeAndFlush(
    entities: AnyEntity<any> | AnyEntity<any>[],
    message?: string,
    data?: Record<string, any>
  ) {
    try {
      this.remove(entities);
      await this.em.flush();
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
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
