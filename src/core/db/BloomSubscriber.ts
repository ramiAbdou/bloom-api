/* eslint-disable class-methods-use-this */

import {
  AnyEntity,
  ChangeSet,
  EventSubscriber,
  FlushEventArgs
} from '@mikro-orm/core';

import cache from '@core/cache';
import logger, { LoggerChangeSet, LoggerChangeType } from '@util/logger';

export default class BloomSubscriber implements EventSubscriber {
  async onFlush<T>({ em, uow }: FlushEventArgs): Promise<void> {
    const changes: LoggerChangeSet[] = uow
      .getChangeSets()
      .map((changeSet: ChangeSet<AnyEntity<any>>) => {
        const { collection: table, entity, payload, type } = changeSet;

        let changeType: LoggerChangeType = 'CREATE';
        if (payload?.deletedAt) changeType = 'DELETE';
        else if (type === 'update') changeType = 'UPDATE';
        return { id: entity.id, payload, table, type: changeType };
      });

    logger.log({ changes, contextId: em.id, level: 'ON_FLUSH' });
  }

  /**
   * If a flush was successful, then we grab the change sets and invalidate
   * every value in the cache who has dependencies that were just updated.
   */
  async afterFlush<T>({ uow }: FlushEventArgs): Promise<void> {
    const idsToInvalidate = uow
      .getChangeSets()
      .map(({ entity }: ChangeSet<AnyEntity<any>>) => entity.id);

    cache.invalidateEntriesByDependencies(idsToInvalidate);
  }
}
