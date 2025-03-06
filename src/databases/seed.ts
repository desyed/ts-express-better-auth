/* eslint-disable no-console */
import '@/configs/env';

import { pool } from '@/databases';

type TSeed = () => Promise<void>;
const seeds: TSeed[] = [];

export async function runSeeds() {
  console.log('🚀 Starting database seeding...');
  for (const seed of seeds) {
    await seed();
  }
  console.log('✨ Database seeding completed successfully!');
  await pool.end();
  console.log('👋 Database connection closed');
}

runSeeds();
