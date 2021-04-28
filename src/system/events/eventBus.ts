import { EventEmitter } from 'events';

import processGoogleEvent from '@integrations/google/processGoogleEvent';
import { BusEvent } from '@util/constants.events';
import createTask from '../../entities/task/repo/createTask';
import sendEmails from '../emails/sendEmails';

export interface EmitEventOptions {
  delay?: number; // In ms.
}

const eventBus: EventEmitter = new EventEmitter()
  .on(BusEvent.EMAIL_EVENT, sendEmails)
  .on(BusEvent.GOOGLE_EVENT, processGoogleEvent)
  .on(BusEvent.TASK_EVENT, createTask);

export default eventBus;
