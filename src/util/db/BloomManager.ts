/**
 * @fileoverview Utility: BloomManager
 * @author Rami Abdou
 */

import { EntityManager } from 'mikro-orm';

import {
  Community,
  CommunityApplication,
  Event,
  EventAttendee,
  EventRSVP,
  Membership,
  MembershipData,
  MembershipPayment,
  MembershipQuestion,
  MembershipType,
  User
} from '@entities';
import db from './db';

export default class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em.fork();
  }

  fork = () => new BloomManager();

  /**
   * REPOSITORIES - Exports all of the entity repositories. They are already
   * type-casted (defined in the entity definition itself).
   */

  communityRepo = () => this.em.getRepository(Community);

  communityApplicationRepo = () => this.em.getRepository(CommunityApplication);

  eventRepo = () => this.em.getRepository(Event);

  eventAttendeeRepo = () => this.em.getRepository(EventAttendee);

  eventRSVPRepo = () => this.em.getRepository(EventRSVP);

  membershipRepo = () => this.em.getRepository(Membership);

  membershipDataRepo = () => this.em.getRepository(MembershipData);

  membershipPaymentRepo = () => this.em.getRepository(MembershipPayment);

  membershipQuestionRepo = () => this.em.getRepository(MembershipQuestion);

  membershipTypeRepo = () => this.em.getRepository(MembershipType);

  userRepo = () => this.em.getRepository(User);
}
