import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import appRouter from '@/app/index';
import env from '@/config/env';
import { errorHandler, notFoundHandler } from '@/lib/error';

import { auth } from './lib/auth';
import { allowSessionOrigins } from './middlewares/cors.middleware';
const app = express();

// The client’s IP address is understood as the left-most entry in the X-Forwarded-For header
app.enable('trust proxy');

app.use(
  helmet({
    xPoweredBy: false,
  })
);

app.use(allowSessionOrigins);

// Add a custom X-Powered-By header
app.use((_, res, next) => {
  res.setHeader('x-powered-by', env.APP_NAME);
  next();
});

app.all('/api/auth/*', toNodeHandler(auth));

app.use(cookieParser());

app.use(express.json({ limit: '2mb' }));

if (env.LOGGER.includes('info')) {
  app.use(morgan('dev'));
}

app.use('/', appRouter);
appRouter.use('*', notFoundHandler);
app.use(errorHandler);

export default app;
