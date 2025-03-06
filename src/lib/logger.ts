/* eslint-disable no-console */

import env from '../config/env';

export const logger = {
  debug: (...arg: unknown[]) => {
    if (env.LOGGER.includes('debug')) {
      console.debug(...arg);
    }
  },
  info: (...arg: unknown[]) => {
    if (env.LOGGER.includes('info')) {
      console.info(...arg);
    }
  },
  warn: (...arg: unknown[]) => {
    if (env.LOGGER.includes('warn')) {
      console.warn(...arg);
    }
  },
  error: (...arg: unknown[]) => {
    if (env.LOGGER.includes('error')) {
      console.error(...arg);
    }
  },
  trace: (...arg: unknown[]) => {
    if (env.LOGGER.includes('trace')) {
      console.trace(...arg);
    }
  },
  silent: (...arg: unknown[]) => {
    if (env.LOGGER.includes('silent')) {
      console.log(...arg);
    }
  },
};
