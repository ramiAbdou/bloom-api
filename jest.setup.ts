import 'jest-extended';
import './google.json';

import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';

jest.setTimeout(30000);

day.extend(advancedFormat);
day.extend(utc);
day.extend(timezone);

let dotEnvName: string;

if (process.env.APP_ENV === 'dev') dotEnvName = '.env.dev';
else if (process.env.APP_ENV === 'stage') dotEnvName = '.env.stage';
else if (process.env.APP_ENV === 'prod') dotEnvName = '.env.prod';

dotenv.config({ path: dotEnvName });
