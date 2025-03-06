import { Router } from 'express';

import env from '@/config/env';

const appRouter = Router();

if (
  env.NODE_ENV === 'dev' ||
  env.NODE_ENV === 'test' ||
  env.NODE_ENV === 'local' ||
  env.NODE_ENV === 'stg'
) {
  appRouter.get('/env', (_req, res) => {
    res.json(env);
  });
}

export default appRouter;
