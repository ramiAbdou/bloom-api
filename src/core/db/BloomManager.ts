import {
  AnyEntity,
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
  FindOneOptions,
  Loaded,
  New,
  Populate
} from '@mikro-orm/core';

import {
  Community,
  CommunityApplication,
  CommunityIntegrations,
  Member,
  MemberData,
  MemberType,
  Question,
  User
} from '@entities/entities';
import { buildCacheKey } from '@util/util';
import cache from '../cache';
import db from './db';

interface BloomFindOneOptions<T, P> extends FindOneOptions<T, P> {
  cacheKey?: string;
}

/**
 * Recreates some of the Entity Manager functionality in order to handle
 * functionality such as our custom built-in caching mechanism, as well as
 * other utility methods like deleteAndPersist, which only mark an entity
 * as deleted, instead of actually deleting it.
 */
export default class BloomManager {
  em: EntityManager;

  constructor(em?: EntityManager) {
    this.em = em || db.em.fork();
  }

  fork = () => new BloomManager();

  async findOne<T, P>(
    entityName: EntityName<T>,
    where: FilterQuery<T>,
    options?: BloomFindOneOptions<T, P>
  ): Promise<Loaded<T, P>> {
    // Try to find and return the entity from the cache. We must return it as
    // a resolved Promise to ensure type safety.
    const { cacheKey } = options ?? {};
    const key = cacheKey ?? buildCacheKey({ entityName, where, ...options });
    if (cache.has(key)) return cache.get(key) as Promise<Loaded<T, P> | null>;

    // If not found, get it from the DB.
    const result = await this.em.findOne<T, P>(entityName, where, {
      ...options
    });

    // Update the cache after fetching from the DB.
    cache.set(key, result);
    return result;
  }

  /**
   * Key difference: this actually persists the newly created entity, which
   * we almost always want.
   */
  create<T extends AnyEntity<T>, P extends Populate<T> = any>(
    entityName: EntityName<T>,
    data: EntityData<T>
  ): New<T, P> {
    const entity: New<T, P> = this.em.create(entityName, data, {
      managed: true
    });

    return entity;
  }

  /**
   * REPOSITORIES - Exports all of the entity repositories. They are already
   * type-casted (defined in the entity definition itself).
   */

  communityRepo = () => this.em.getRepository(Community);

  communityApplicationRepo = () => this.em.getRepository(CommunityApplication);

  communityIntegrationsRepo = () =>
    this.em.getRepository(CommunityIntegrations);

  memberRepo = () => this.em.getRepository(Member);

  memberDataRepo = () => this.em.getRepository(MemberData);

  questionRepo = () => this.em.getRepository(Question);

  memberTypeRepo = () => this.em.getRepository(MemberType);

  userRepo = () => this.em.getRepository(User);
}
