import { ObjectType } from 'type-graphql';
import { Entity, Enum, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { TaskEvent } from '@util/events';

enum TaskStatus {
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
  STARTED = 'STARTED',
  WAITING = 'WAITING'
}

@ObjectType()
@Entity()
export default class Task extends BaseEntity {
  @Enum({ items: () => TaskEvent, type: String })
  event: TaskEvent;

  @Property()
  executeAt: string;

  @Enum({ items: () => TaskStatus, type: String })
  status: TaskStatus = TaskStatus.WAITING;
}
