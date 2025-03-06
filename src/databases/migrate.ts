/* eslint-disable no-console */
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import db, { pool } from '@/databases';

async function run() {
  console.log('🚀 Starting database migration...');
  try {
    await migrate(db, { migrationsFolder: './migrations/drizzle' });
    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('👋 Database connection closed');
  }
}

run();
