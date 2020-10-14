/**
 * @fileoverview Seeder: Development Database
 * @author Rami Abdou
 */

import '@util/util';

import db from '@util/db/db';

(async () => {
  await db.cleanForTesting();
})();
