#!/usr/bin/env node
/* eslint-disable no-console */
import { createServer } from 'node:http';

import app from '@/app';
import env from '@/config/env';

import { dbAuthenticate } from './databases';
import { printLocalConnections } from './lib/os';

async function bootstrap() {
  try {
    await dbAuthenticate();
    const server = createServer(app);
    server.listen(env.PORT, () => {
      console.log(`🚀 \x1b[33mServer running at on:${env.PORT}\x1b[0m`);
      printLocalConnections(env.PORT);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  process.on('unhandledRejection', (error: any) => {
    // Sentry.captureException(error);
    console.error('🚨 \x1b[31mUnhandled Rejection:\x1b[0m', error);
    process.exit(1); // Optional: Exit the process after an unhandled rejection
  });
}

bootstrap();
