/**
 * @fileoverview Utility: Logger
 * - Controls all of the logging functionality. Writes the logs to a local
 * file on disk. Writes to a new file every day.
 * @author Rami Abdou
 */

import deline from 'deline';
import fs from 'fs';
import moment from 'moment';

import { now, singleLineStringify } from '@util/util';
import { LoggerLevel } from './constants';

class Logger {
  error = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('ERROR', message, data), true);

  info = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('INFO', message, data));

  warn = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('WARN', message, data), true);

  private formatMessage = (
    level: LoggerLevel,
    message: string,
    data?: Record<string, any>
  ) => {
    const result = `${now()} | ${level} | ${deline(message)}`;
    return !data
      ? result
      : `${result} | ${singleLineStringify(this.formatData(data))}`;
  };

  /**
   * Writes the given message to a file in the ./logs/ folder based on the
   * current UTC date. Adds a newline character as well.
   */
  private writeToFile = (message: string, writeToConsole = false) => {
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    const filename = `./logs/${moment.utc().format('MM-D-YY')}.txt`;
    fs.appendFileSync(filename, `${message}\n\n`);

    // eslint-disable-next-line no-console
    if (writeToConsole) console.log(`${message}\n\n`);
  };

  /**
   * Formats the data so that it returns the respective IDs of the entities.
   * If an ID field doesn't exist on the value, just keep the value.
   */
  private formatData = (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      // If the ID exists on the value, change the value to that.
      data[key] = value.id || value;
    });

    return data;
  };
}

export default new Logger();