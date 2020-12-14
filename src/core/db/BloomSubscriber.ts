/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable class-methods-use-this */

import {
  AnyEntity,
  ChangeSet,
  EventSubscriber,
  FlushEventArgs
} from '@mikro-orm/core';

import logger, { LoggerChangeSet } from '@util/logger';

export default class BloomSubscriber implements EventSubscriber {
  async onFlush<T>({ em, uow }: FlushEventArgs): Promise<void> {
    const changes: LoggerChangeSet[] = uow
      .getChangeSets()
      .map((changeSet: ChangeSet<AnyEntity<any>>) => {
        const { collection, entity, payload, type } = changeSet;
        return {
          id: entity.id,
          table: collection,
          type: type === 'create' ? 'CREATE' : 'UPDATE',
          payload
        };
      });

    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    logger.log({ contextId: em.id, level: 'ON_FLUSH', changes });
  }
}
