import { EntityManager } from '@mikro-orm/core';

import {
  Community,
  CommunityApplication,
  CommunityIntegrations,
  Event,
  EventAttendee,
  EventRSVP,
  Member,
  MemberData,
  MemberType,
  Question,
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

  communityIntegrationsRepo = () =>
    this.em.getRepository(CommunityIntegrations);

  eventRepo = () => this.em.getRepository(Event);

  eventAttendeeRepo = () => this.em.getRepository(EventAttendee);

  eventRSVPRepo = () => this.em.getRepository(EventRSVP);

  memberRepo = () => this.em.getRepository(Member);

  memberDataRepo = () => this.em.getRepository(MemberData);

  questionRepo = () => this.em.getRepository(Question);

  memberTypeRepo = () => this.em.getRepository(MemberType);

  userRepo = () => this.em.getRepository(User);
}
