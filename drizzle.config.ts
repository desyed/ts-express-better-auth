import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables
config({
  path: '.env',
  override: true,
});

// Get DB_URL from environment variables
const dbConnection = process.env['DB_URL'];

// Check if DB_URL is set
if (!dbConnection) {
  throw new Error('DB_URL is not set');
}

// Check if DB_URL is a string
if (typeof dbConnection !== 'string') {
  throw new Error('DB_URL is not a string');
}

// Define Drizzle config
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/databases/**/*.schema.ts',
  out: './src/databases/migrations/drizzle',
  dbCredentials: {
    url: `${process.env['DB_URL']}`,
  },
});
