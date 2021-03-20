import 'jest-chain';
import './google.json';
import '@core/db/db';

import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';

jest.setTimeout(30000);

day.extend(advancedFormat);
day.extend(utc);
day.extend(timezone);

dotenv.config({ path: '.env.dev' });
