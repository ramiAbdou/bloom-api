/**
 * @fileoverview Utility: BloomManager
 * @author Rami Abdou
 */

import { AnyEntity, EntityManager } from 'mikro-orm';

import {
  Community,
  Event,
  EventAttendee,
  EventRSVP,
  Membership,
  User
} from '@entities/entities';
import logger from '@logger';
import db from './db';

export default class BloomManager {
  em: EntityManager;

  constructor() {
    this.em = db.em.fork();
  }

  /**
   * Tries to flush the managed entities to the database, but if it fails,
   * log the error.
   */
  flush = async (message?: string, data?: Record<string, any>) => {
    try {
      await this.em.flush();
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
    }
  };

  /**
   * Persist and flush the given entities.
   */
  persistAndFlush = async (
    entities: AnyEntity<any> | AnyEntity<any>[],
    message?: string,
    data?: Record<string, any>
  ) => {
    try {
      await this.em.persistAndFlush(entities);
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
    }
  };

  /**
   * Persists the entity and pushes the log until the Entity Manager either
   * flushes the changes or clears the changes.
   */
  persist = (entities: AnyEntity<any> | AnyEntity<any>[]) =>
    this.em.persist(entities);

  /**
   * Removes and flushes the given entities.
   */
  removeAndFlush = async (
    entities: AnyEntity<any> | AnyEntity<any>[],
    message?: string,
    data?: Record<string, any>
  ) => {
    try {
      this.remove(entities);
      await this.em.flush();
      if (message) logger.info(message, data);
    } catch (e) {
      logger.error(new Error(e));
    }
  };

  /**
   * Removes the entity from the entity manager and pushes the appropriate
   * logs to the class.
   */
  private remove = (entities: AnyEntity<any> | AnyEntity<any>[]) =>
    this.em.remove(entities);

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
