import { EventEmitter } from 'events';

import { MiscEvent } from '@util/events';
import sendEmails from './emails/sendEmails';

const eventBus = new EventEmitter();

eventBus.on(MiscEvent.SEND_EMAIL, async (args) => sendEmails(args));

export default eventBus;
