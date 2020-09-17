/**
 * @fileoverview Utility: Logger
 * - Controls all of the logging functionality. Writes the logs to a local
 * file on disk. Writes to a new file every day.
 * @author Rami Abdou
 */

import deline from 'deline';
import fs from 'fs';
import moment from 'moment';

import { now } from '@util/util';
import { LoggerLevel } from './constants';

class Logger {
  error = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('ERROR', message, data));

  info = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('INFO', message, data));

  warn = (message: string, data?: Record<string, any>) =>
    this.writeToFile(this.formatMessage('WARN', message, data));

  private formatMessage = (
    level: LoggerLevel,
    message: string,
    data?: Record<string, any>
  ) => {
    const result = `${now} | ${level} | ${deline(message)}`;
    return !data
      ? result
      : `${result} | ${JSON.stringify(this.formatData(data), null, 2)}`;
  };

  /**
   * Writes the given message to a file in the ./logs/ folder based on the
   * current UTC date. Adds a newline character as well.
   */
  private writeToFile = (message: string) => {
    const date = moment.utc().format('MM-D-YY');
    const stream = fs.createWriteStream(`./logs/${date}`);
    stream.write(`${message}\n`);
    stream.end();
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
