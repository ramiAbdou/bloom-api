/**
 * @fileoverview Utility: BloomManager
 * @author Rami Abdou
 */

import { EntityManager } from 'mikro-orm';

import {
  Community,
  Event,
  EventAttendee,
  EventRSVP,
  Membership,
  User
} from '@entities';
import db from './db';

export default class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em.fork();
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
