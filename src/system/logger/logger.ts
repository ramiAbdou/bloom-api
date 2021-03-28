import day from 'dayjs';
import fs from 'fs';
import { AnyEntity, EntityData } from '@mikro-orm/core';

import { BusEvent, GoogleEvent } from '@util/constants.events';
import { now } from '@util/util';

type LoggerLevel =
  | 'AFTER_FLUSH'
  | 'BEFORE_FLUSH'
  | 'ERROR'
  | 'FLUSH_ERROR'
  | 'INFO'
  | 'ON_FLUSH';

export type LoggerChangeType = 'CREATE' | 'DELETE' | 'UPDATE';

export type LoggerChangeSet = {
  id: string;
  payload: EntityData<AnyEntity<any>>;
  table: string;
  type: LoggerChangeType;
};

interface LoggerLog {
  changes?: LoggerChangeSet[];
  contextId?: string;
  error?: string;
  event?: GoogleEvent | BusEvent;
  level: LoggerLevel;
  timestamp: string;
}

/**
 * Controls all of the logging functionality. Writes the logs to a local
 * file on disk. Writes to a new file every day.
 */
class Logger {
  /**
   * Writes the given message to a file in the ./logs/ folder based on the
   * current UTC date. Adds a newline character as well.
   */
  log = (input: Omit<LoggerLog, 'timestamp'>) => {
    setTimeout(() => {
      const { changes, contextId, error, event, level } = input;

      const formatedChanges = !changes
        ? null
        : changes.map(({ id, payload, table, type }) => ({
            id,
            table,
            type,
            ...(payload ? { payload } : {})
          }));

      const formattedLog = JSON.stringify(
        {
          timestamp: now(),
          ...(contextId ? { contextId } : {}),
          ...(level ? { level } : {}),
          ...(event ? { event } : {}),
          ...(changes ? { changes: formatedChanges } : {}),
          ...(error ? { error } : {})
        },
        null,
        2
      );

      if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
      const filename = `./logs/${day.utc().format('MM-D-YY')}.txt`;
      fs.appendFileSync(filename, `${formattedLog}\n\n`);

      // eslint-disable-next-line no-console
      if (input.error) console.log(input.error);
    }, 0);
  };
}

export default new Logger();
