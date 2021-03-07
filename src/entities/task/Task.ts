import { Entity, Enum, Property } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { EventReminderPayload } from '@system/emails/util/getEventReminderVars';
import { emitEmailEvent } from '@system/eventBus';
import { EmailEvent, TaskEvent } from '@util/events';

export interface TaskPayload {
  communityId?: string;
  eventId?: string;
}

@Entity()
export default class Task extends BaseEntity {
  static cache = new Cache();

  // ## FIELDS

  @Property()
  executeAt: string;

  @Enum({ items: () => TaskEvent, type: String })
  event: TaskEvent;

  @Property({ type: 'json' })
  payload: TaskPayload;

  // ## METHODS

  execute() {
    switch (this.event) {
      case TaskEvent.EVENT_REMINDER_1_DAY:
        emitEmailEvent(EmailEvent.EVENT_REMINDER, {
          eventId: this.payload.eventId
        } as EventReminderPayload);

        break;

      case TaskEvent.EVENT_REMINDER_1_HOUR:
        emitEmailEvent(EmailEvent.EVENT_REMINDER, {
          eventId: this.payload.eventId
        } as EventReminderPayload);

        break;

      default:
        break;
    }
  }
}
