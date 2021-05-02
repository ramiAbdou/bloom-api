import {
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  Loaded,
  wrap
} from '@mikro-orm/core';

import db from './db';

/**
 * Returns the updated entity, if it was found.
 */
export async function findOne<T, P>(
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  options?: FindOneOptions<T, P>
): Promise<Loaded<T, P>> {
  const em: EntityManager = db.em?.fork();
  return em.findOne<T, P>(entityName, where, options);
}

/**
 * Returns the updated entity, if it was found.
 */
export async function findOneAndUpdate<T, P>(
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  data: EntityData<T>
): Promise<Loaded<T, P>> {
  const em: EntityManager = db.em.fork();
  const entity: Loaded<T, P> = await em.findOne<T, P>(entityName, where);

  // If not found, return null and don't try to update.
  if (!entity) return null;

  // Otherwise, wrap the entity and assign the new data.
  const updatedEntity: Loaded<T, P> = wrap(entity).assign(data);
  await em.flush();
  return updatedEntity;
}

/**
 * Returns the updated entities, if it was found.
 */
export async function find<T, P>(
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  options?: FindOptions<T, P>
): Promise<Loaded<T, P>[]> {
  const em: EntityManager = db.em?.fork();
  return em.find<T, P>(entityName, where, options);
}

/**
 * Returns the updated entities, if it was found.
 */
export async function findAndUpdate<T, P>(
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  data: EntityData<T>
): Promise<Loaded<T, P>[]> {
  const em: EntityManager = db.em.fork();
  const entities = await em.find<T, P>(entityName, where);

  const updatedEntities: Loaded<T, P>[] = entities.map(
    (entity: Loaded<T, P>) => {
      return wrap(entity).assign(data);
    }
  );

  await em.flush();
  return updatedEntities;
}

/**
 * Returns the updated entity, if it was found.
 */
export async function createAndFlush<T>(
  entityName: EntityName<T>,
  data: EntityData<T>
): Promise<T> {
  const em: EntityManager = db.em?.fork();
  const entity: T = em.create(entityName, data);
  await em.flush();
  return entity;
}
