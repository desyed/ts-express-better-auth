/* eslint-disable perfectionist/sort-imports */
/* eslint-disable no-console */

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PgDialect } from 'drizzle-orm/pg-core';
import pg from 'pg';

import * as schemas from '@/databases/schema';

import env from '@/config/env';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DB_URL,
});

const db = drizzle({
  client: pool,
  schema: schemas,
  logger: false,
});

export function dbAuthenticate(): Promise<Date> {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 5000;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const trySetTimezone = () => {
      db.execute(sql`SET TIMEZONE='UTC';`)
        .then(() => {
          console.log('\n🔑 \x1b[32mDatabase Connected\x1b[0m');
          console.log(`🔑 \x1b[34mDialect: \x1b[0mpostgresql`);
          console.log(
            '🕒 \x1b[34mDatabase Time zone set to UTC\x1b[0m',
            new Date().toUTCString()
          );
          resolve(new Date());
        })
        .catch((err) => {
          if (err.code === '57P03' && attempts < MAX_RETRIES) {
            console.log(
              `🔄 \x1b[33mDatabase is starting up, retrying... Attempt ${attempts + 1}/${MAX_RETRIES}\x1b[0m`
            );
            attempts++;
            setTimeout(trySetTimezone, RETRY_DELAY);
          } else {
            console.error('🚨 \x1b[31mError setting time zone:\x1b[0m', err);
            reject(err);
          }
        });
    };

    trySetTimezone();
  });
}

export type DB = typeof db;
export type DBTX = Parameters<Parameters<DB['transaction']>[0]>[0] | DB;

export const pgDialect = new PgDialect();

export default db;
