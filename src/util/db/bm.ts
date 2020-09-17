/**
 * @fileoverview Utility: BloomManager
 * @author Rami Abdou
 */

import { AnyEntity, EntityManager } from 'mikro-orm';

import { Community, Membership, MembershipType, User } from '@entities';
import lg from '@lg';
import {
  CommunityRepo,
  MembershipRepo,
  MembershipTypeRepo,
  UserRepo
} from '@repos';

export class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    // Will be populated when the BloomManager instance is forked.
    if (em) this.em = em;
  }

  /*
   ___             
  / __|___ _ _ ___ 
 | (__/ _ \ '_/ -_)
  \___\___/_| \___|          
   */

  /**
   * Tries to flush the managed entities to the database, but if it fails,
   * log the error.
   */
  flush = async (message?: string, data?: Record<string, any>) => {
    try {
      if (message) lg.info(message, data);
      await this.em.flush();
    } catch (e) {
      lg.error(e);
    }
  };

  /**
   * Persist and flush the given entities.
   */
  persistAndFlush = async (
    entities:
      | AnyEntity<any, string | number | symbol>
      | AnyEntity<any, string | number | symbol>[],
    message?: string,
    data?: Record<string, any>
  ) => {
    try {
      await this.em.persistAndFlush(entities);
      if (message && data) lg.info(message, data);
      else if (message) lg.info(message);
      lg.info('FLUSHED');
    } catch (e) {
      lg.error(e);
      lg.error('FAILED TO FLUSH');
    }
  };

  /**
   * Persists the entity and pushes the log until the Entity Manager either
   * flushes the changes or clears the changes.
   */
  persist = (
    entities:
      | AnyEntity<any, string | number | symbol>
      | AnyEntity<any, string | number | symbol>[]
  ) => {
    this.em.persist(entities);
  };

  /**
   * Removes and flushes the given entities.
   */
  removeAndFlush = async (
    entities:
      | AnyEntity<any, string | number | symbol>
      | AnyEntity<any, string | number | symbol>[],
    message?: string,
    data?: Record<string, any>
  ) => {
    try {
      this.remove(entities);
      await this.em.flush();

      if (message && data) lg.info(message, data);
      else if (message) lg.info(message);
      lg.info('FLUSHED');
    } catch (e) {
      lg.error(e);
      lg.error('FAILED TO FLUSH');
    }
  };

  /**
   * Removes the entity from the entity manager and pushes the appropriate
   * logs to the class.
   */
  private remove = (
    entities:
      | AnyEntity<any, string | number | symbol>
      | AnyEntity<any, string | number | symbol>[]
  ) => {
    if (!Array.isArray(entities)) this.em.removeEntity(entities);
    else {
      entities.forEach((entity: AnyEntity<any, string | number | symbol>) =>
        this.em.removeEntity(entity)
      );
    }
  };

  /**
   * Merges given entity to this EntityManager so it becomes managed.
   */
  merge = (
    entities:
      | AnyEntity<any, string | number | symbol>
      | AnyEntity<any, string | number | symbol>[]
  ) => {
    if (!Array.isArray(entities)) this.em.merge(entities);
    else entities.forEach((entity) => this.em.merge(entity));
  };

  /**
   * Returns a new BloomManager with a forked entity manager and new context.
   */
  fork = () => new BloomManager(this.em.fork());

  /*
  ___                  _ _           _        
 | _ \___ _ __  ___ __(_) |_ ___ _ _(_)___ ___
 |   / -_) '_ \/ _ (_-< |  _/ _ \ '_| / -_|_-<
 |_|_\___| .__/\___/__/_|\__\___/_| |_\___/__/
         |_|                                  
  */

  communityRepo = () => this.em.getRepository(Community) as CommunityRepo;

  membershipRepo = () => this.em.getRepository(Membership) as MembershipRepo;

  membershipTypeRepo = () =>
    this.em.getRepository(MembershipType) as MembershipTypeRepo;

  userRepo = () => this.em.getRepository(User) as UserRepo;
}

export default new BloomManager();
