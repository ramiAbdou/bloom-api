/* eslint-disable import/first */
/* eslint-disable simple-import-sort/sort */

import dotenv from 'dotenv';
import path from 'path';

if (process.env.APP_ENV === 'dev') {
  dotenv.config({ path: path.join(__dirname, '../../../.env.dev') });
}

if (process.env.APP_ENV === 'stage') {
  dotenv.config({ path: path.join(__dirname, '../../../.env.stage') });
}

if (process.env.APP_ENV === 'prod') {
  dotenv.config({ path: path.join(__dirname, '../../../.env.prod') });
}

import 'reflect-metadata'; // Needed for type-graphql compilation.

import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import dbConfig from 'mikro-orm.config';
import { MikroORM } from '@mikro-orm/core';
import { ISchemaGenerator } from '@mikro-orm/core/typings';

day.extend(advancedFormat);
day.extend(utc);
day.extend(timezone);

(async () => {
  const orm: MikroORM = await MikroORM.init(dbConfig);
  const generator: ISchemaGenerator = orm.getSchemaGenerator();
  const createDump: string = await generator.getCreateSchemaSQL(false);
  console.log(createDump);
  await orm.close(true);
})();
