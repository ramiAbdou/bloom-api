import { Entity, Enum, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { EmailEvent, TaskEvent } from '@util/constants.events';

export interface TaskPayload {
  communityId?: string;
  eventId?: string;
}

@Entity()
export default class Task extends BaseEntity {
  // ## FIELDS

  @Property()
  executeAt: string;

  @Enum({ items: () => TaskEvent, type: String })
  event: TaskEvent;

  @Property({ type: 'json' })
  payload: TaskPayload;

  // ## METHODS

  execute(): void {
    switch (this.event) {
      case TaskEvent.EVENT_REMINDER_1_DAY:
        emitEmailEvent({
          event: EmailEvent.EVENT_REMINDER,
          payload: { eventId: this.payload.eventId }
        });

        break;

      case TaskEvent.EVENT_REMINDER_1_HOUR:
        emitEmailEvent({
          event: EmailEvent.EVENT_REMINDER,
          payload: { eventId: this.payload.eventId }
        });

        break;

      default:
        break;
    }
  }
}
