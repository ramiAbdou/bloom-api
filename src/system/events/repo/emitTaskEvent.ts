import { TaskPayload } from '@entities/task/Task';
import { BusEvent, TaskEvent } from '@util/constants.events';
import eventBus from '../eventBus';

/**
 * Emits an TASK_EVENT with the given event and payload.
 *
 * @param event
 * @param payload
 */
const emitTaskEvent = (event: TaskEvent, payload: TaskPayload) => {
  eventBus.emit(BusEvent.SCHEDULE_TASK, { event, payload });
};

export default emitTaskEvent;
