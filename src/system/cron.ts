import day from 'dayjs';
import cron from 'node-cron';

import BloomManager from '@core/db/BloomManager';
import Task from '../entities/task/Task';

// Runs every 5 minutes.

cron.schedule('*/5 * * * *', async () => {
  const bm = new BloomManager();

  // Get all the Tasks with executeAt time that is before the current time
  // and that haven't finished.
  const tasks: Task[] = await bm.find(Task, {
    executeAt: { $lte: day.utc().format() }
  });

  tasks.forEach((task: Task) => {
    task.execute();
    bm.em.remove(task);
  });

  await bm.flush();
});
