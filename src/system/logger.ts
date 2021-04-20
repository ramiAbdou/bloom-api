import LogDnaWinston from 'logdna-winston';
import winston from 'winston';

const logger: winston.Logger = winston.createLogger();

logger.add(
  new LogDnaWinston({
    app: `Bloom API (${process.env.APP_ENV})`,
    env: process.env.APP_ENV,
    handleExceptions: true,
    indexMeta: true,
    key: process.env.LOGDNA_INGESTION_KEY
  })
);

export default logger;
