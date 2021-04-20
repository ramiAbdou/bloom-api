import day from 'dayjs';

import BloomManager from '@core/db/BloomManager';
import Task from '@entities/task/Task';

/**
 * Executes all of the pending Task(s) stored in the DB, then removes them
 * after execution.
 */
const handlePendingTasks = async (): Promise<void> => {
  const bm = new BloomManager();

  // Get all the Tasks with executeAt time that is before the current time
  // and that haven't finished.
  const tasks: Task[] = await bm.em.find(Task, {
    executeAt: { $lte: day.utc().format() }
  });

  tasks.forEach((task: Task) => {
    task.execute();
    bm.em.remove(task);
  });

  await bm.em.flush();
};

export default handlePendingTasks;
