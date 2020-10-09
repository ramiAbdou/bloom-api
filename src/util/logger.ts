/**
 * @fileoverview Utility: Logger
 * - Controls all of the logging functionality. Writes the logs to a local
 * file on disk. Writes to a new file every day.
 * @author Rami Abdou
 */

import fs from 'fs';
import moment from 'moment';

import { now } from '@util/util';
import { LoggerEvent } from './constants';

type LoggerLevel = 'INFO' | 'ERROR' | 'WARN';

interface LoggerLog extends Record<string, any> {
  entityId?: string;
  error?: Error;
  event: LoggerEvent;
  level: LoggerLevel;
  timestamp: string;
}

class Logger {
  error = (event: LoggerEvent, error?: Error) => {
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    const baseLog: LoggerLog = { level: 'ERROR', event, timestamp: now() };
    const log: LoggerLog = error ? { ...baseLog, error } : baseLog;
    this.writeToFile(log, true);
  };

  info = (event: LoggerEvent, entityId?: string) => {
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    const baseLog: LoggerLog = { level: 'INFO', event, timestamp: now() };
    const log: LoggerLog = entityId ? { ...baseLog, entityId } : baseLog;
    this.writeToFile(log);
  };

  warn = (event: LoggerEvent, error?: Error) => {
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    const baseLog: LoggerLog = { level: 'WARN', event, timestamp: now() };
    const log: LoggerLog = error ? { ...baseLog, error } : baseLog;
    this.writeToFile(log, true);
  };

  /**
   * Writes the given message to a file in the ./logs/ folder based on the
   * current UTC date. Adds a newline character as well.
   */
  private writeToFile = (log: LoggerLog, writeToConsole = false) => {
    const formattedLog = JSON.stringify(log, null, 1).replace(/\s+/g, ' ');
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    const filename = `./logs/${moment.utc().format('MM-D-YY')}.txt`;
    fs.appendFileSync(filename, `${formattedLog}\n\n`);

    // eslint-disable-next-line no-console
    if (writeToConsole) console.log(`${formattedLog}\n\n`);
  };
}

export default new Logger();
