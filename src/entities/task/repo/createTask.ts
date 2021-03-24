import day from 'dayjs';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import { FlushEvent, TaskEvent } from '@util/constants.events';
import Task from '../Task';

/**
 * Returns a UTC timestamp for when to execute the Task.
 *
 * @param args - Task data (eg: event, payload).
 */
const calculateExecuteAt = async (args: EntityData<Task>): Promise<string> => {
  const { event: taskEvent, payload } = args;
  const { communityId, eventId } = payload;

  const bm: BloomManager = new BloomManager();

  const [_, event]: [Community, Event] = await Promise.all([
    bm.findOne(Community, communityId),
    bm.findOne(Event, eventId)
  ]);

  if (taskEvent === TaskEvent.EVENT_REMINDER_1_DAY) {
    return day.utc(event.startTime).subtract(1, 'day').format();
  }

  if (taskEvent === TaskEvent.EVENT_REMINDER_1_HOUR) {
    return day.utc(event.startTime).subtract(1, 'hour').format();
  }

  return null;
};

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
    { flushEvent: FlushEvent.CREATE_TASK }
  );

  return task;
};

export default createTask;
