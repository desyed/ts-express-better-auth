/* eslint-disable no-console */

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'node:path';
import { z } from 'zod';

const envPath = '.env';

expand(
  config({
    path: [path.resolve(process.cwd(), envPath)],
    override: true,
  })
);

const EnvSchema = z.object({
  APP_NAME: z.string().default('galaxydigital'),
  NODE_ENV: z.enum(['prod', 'stg', 'dev', 'local', 'test']),
  PORT: z.coerce.number().default(3000),
  DOMAIN: z.string(),
  BASE_URL: z.string(),
  LOGGER: z
    .string()
    .transform((logger) => logger.trim().split(','))
    .refine(
      (logger) =>
        logger.every((level) =>
          ['debug', 'info', 'warn', 'error', 'trace'].includes(level)
        ),
      { message: 'Invalid LOGGER level' }
    )
    .default(''),
  DB_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
