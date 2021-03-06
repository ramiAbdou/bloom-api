import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { MutationEvent } from '@util/events';
import Task from '../Task';
import calculateExecuteAt from './calculateExecuteAt';

/**
 * Creates a scheduled Task.
 *
 * @param args.event - Ex: TaskEvent.EVENT_REMINDER_1_DAY.
 * @param args.payload - Ex: { eventId: "1", userId: "2" }
 */
const createTask = async (args: EntityData<Task>): Promise<Task> => {
  const task: Task = await new BloomManager().createAndFlush(
    Task,
    { ...args, executeAt: args.executeAt ?? (await calculateExecuteAt(args)) },
    { flushEvent: MutationEvent.CREATE_TASK }
  );

  return task;
};

export default createTask;
