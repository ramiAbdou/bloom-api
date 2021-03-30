import 'jest-chain';
import 'jest-sorted';
import './google.json';
import '@core/db/db';

import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

day.extend(advancedFormat);
day.extend(utc);
day.extend(timezone);

jest.setTimeout(30000);
