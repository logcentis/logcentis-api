import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/types/db';
import { env } from '@/common/utils/envConfig';
import logger from '@/common/utils/logger';

const poolConfig = {
  production: {
    connectionString: env.DB_URL_PROD,
    max: 10,
  },
  development: {
    connectionString: env.DB_URL_DEV,
    max: 10,
  },
  test: {
    connectionString: env.DB_URL_TEST,
    max: 10,
  },
};

const dialect = new PostgresDialect({
  pool: new Pool(poolConfig[env.NODE_ENV || 'development']),
});

const db = new Kysely<DB>({
  dialect,
  log: (event) => {
    if (env.isDevelopment) {
      logger.debug(event.query.sql);
    }

    if (event.level === 'error') {
      logger.error(event.error);
    }
  },
});

export default db;
