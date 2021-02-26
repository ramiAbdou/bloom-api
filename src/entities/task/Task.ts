import { Entity, Enum, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { TaskEvent } from '@util/events';

export interface TaskPayload {
  communityId?: string;
  eventId?: string;
}

export enum TaskStatus {
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
  STARTED = 'STARTED',
  WAITING = 'WAITING'
}

@Entity()
export default class Task extends BaseEntity {
  @Property()
  executeAt: string;

  @Enum({ items: () => TaskEvent, type: String })
  event: TaskEvent;

  @Property({ type: 'json' })
  payload: TaskPayload;

  @Enum({ items: () => TaskStatus, type: String })
  status: TaskStatus = TaskStatus.WAITING;
}
