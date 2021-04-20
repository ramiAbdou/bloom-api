import { Entity, Enum, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { EventReminderPayload } from '@system/emails/repo/getEventReminderVars';
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
