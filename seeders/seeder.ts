import day from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import db from '@core/db/db';
import createFreeCommunity from './createFreeCommunity';
import createPaidCommunity from './createPaidCommunity';

day.extend(timezone);
day.extend(utc);

const seedDatabase = async () => {
  await db.createConnection();
  await createFreeCommunity();
  await createPaidCommunity();
  await db.close();
};

seedDatabase();
