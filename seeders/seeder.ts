import db from '@core/db/db';
import createFreeCommunity from './createFreeCommunity';
import createPaidCommunity from './createPaidCommunity';

const seedDatabase = async () => {
  await db.createConnection();
  await createFreeCommunity();
  await createPaidCommunity();
  await db.close();
};

seedDatabase();
