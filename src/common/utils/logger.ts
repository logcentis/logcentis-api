import pino from 'pino';
import { env } from '@/common/utils/envConfig';

const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  transport: env.isProduction ? undefined : { target: 'pino-pretty' },
});

export default logger;