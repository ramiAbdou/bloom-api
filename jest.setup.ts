import dotenv from 'dotenv';

let dotEnvName: string;

if (process.env.APP_ENV === 'dev') dotEnvName = '.env.dev';
else if (process.env.APP_ENV === 'stage') dotEnvName = '.env.stage';
else if (process.env.APP_ENV === 'prod') dotEnvName = '.env.prod';

dotenv.config({ path: dotEnvName });
