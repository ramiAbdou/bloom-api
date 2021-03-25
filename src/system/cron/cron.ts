import cron from 'node-cron';

import handlePendingTasks from './repo/handlePendingTasks';

// Runs every 5 minutes.
cron.schedule('*/5 * * * *', handlePendingTasks);
