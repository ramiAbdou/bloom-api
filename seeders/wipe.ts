import db from '@core/db/db';

(async () => {
  await db.cleanForTesting();
  await db.close();
})();
