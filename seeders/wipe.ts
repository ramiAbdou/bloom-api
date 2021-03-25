import day from 'dayjs';
import utc from 'dayjs/plugin/utc';

import db from '@core/db/db';

day.extend(utc);

(async () => {
  await db.cleanForTesting();
  await db.close();
})();
