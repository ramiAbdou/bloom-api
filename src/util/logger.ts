/* eslint-disable sort-keys-fix/sort-keys-fix */

import day from 'dayjs';
import fs from 'fs';
import { AnyEntity, EntityData } from '@mikro-orm/core';

import { now } from '@util/util';
import { LoggerEvent } from './constants';

type LoggerLevel =
  | 'BEFORE_FLUSH'
  | 'ERROR'
  | 'FLUSH_ERROR'
  | 'FLUSH_SUCCESS'
  | 'INFO'
  | 'ON_FLUSH';

export type LoggerChangeType = {};
export type LoggerChangeSet = {
  id: string;
  payload: EntityData<AnyEntity<any>>;
  table: string;
  type: 'CREATE' | 'UPDATE';
};

type LoggerLog = {
  changes?: LoggerChangeSet[];
  contextId: number;
  error?: string;
  event: LoggerEvent;
  level: LoggerLevel;
  timestamp: string;
};

/**
 * Controls all of the logging functionality. Writes the logs to a local
 * file on disk. Writes to a new file every day.
 */
class Logger {
  log = (input: Partial<LoggerLog>, writeToConsole = false) =>
    this.writeToFile(input, writeToConsole);

  /**
   * Writes the given message to a file in the ./logs/ folder based on the
   * current UTC date. Adds a newline character as well.
   */
  private writeToFile = (log: Partial<LoggerLog>, writeToConsole: boolean) => {
    setTimeout(() => {
      const baseLog: Pick<LoggerLog, 'timestamp'> = { timestamp: now() };
      const formattedLog = JSON.stringify({ ...baseLog, ...log }, null, 2);

      if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
      const filename = `./logs/${day.utc().format('MM-D-YY')}.txt`;
      fs.appendFileSync(filename, `${formattedLog}\n\n`);

      // eslint-disable-next-line no-console
      if (writeToConsole) console.log(`${formattedLog}\n\n`);
    }, 0);
  };
}

export default new Logger();
