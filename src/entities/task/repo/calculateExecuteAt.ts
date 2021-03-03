import day from 'dayjs';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import { TaskEvent } from '@util/events';
import Task from '../Task';

const calculateExecuteAt = async (args: EntityData<Task>): Promise<string> => {
  const { event: taskEvent, payload } = args;

  const bm = new BloomManager();

  const [community, event]: [Community, Event] = await Promise.all([
    bm.findOne(Community, payload.communityId),
    bm.findOne(Event, payload.eventId)
  ]);

  if (taskEvent === TaskEvent.EVENT_REMINDER_1_DAY) {
    return day.utc(event.startTime).subtract(1, 'day').format();
  }

  if (taskEvent === TaskEvent.EVENT_REMINDER_1_HOUR) {
    return day.utc(event.startTime).subtract(1, 'hour').format();
  }

  return null;
};

export default calculateExecuteAt;
