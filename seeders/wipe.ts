import day from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import db from '@core/db/db';

day.extend(timezone);
day.extend(utc);

const wipeDatabase = async () => {
  await db.clean();
  await db.close();
};

wipeDatabase();
