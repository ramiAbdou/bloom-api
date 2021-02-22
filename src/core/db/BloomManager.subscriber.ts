import {
  AnyEntity,
  ChangeSet,
  EventSubscriber,
  FlushEventArgs
} from '@mikro-orm/core';

import logger, { LoggerChangeSet, LoggerChangeType } from '@util/logger';

export default class BloomManagerSubscriber implements EventSubscriber {
  async onFlush<T>({ uow }: FlushEventArgs): Promise<void> {
    const changes: LoggerChangeSet[] = uow
      .getChangeSets()
      .map((changeSet: ChangeSet<AnyEntity<any>>) => {
        const { collection: table, entity, payload, type } = changeSet;

        let changeType: LoggerChangeType = 'CREATE';
        if (payload?.deletedAt || type === 'delete') changeType = 'DELETE';
        else if (type === 'update') changeType = 'UPDATE';
        return { id: entity.id, payload, table, type: changeType };
      });

    logger.log({ changes, level: 'ON_FLUSH' });
  }
}
