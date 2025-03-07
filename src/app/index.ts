import { Router } from 'express';

import profileRouter from '@/app/profile/profile.routes';
import env from '@/config/env';
const appRouter = Router();

if (
  env.NODE_ENV === 'dev' ||
  env.NODE_ENV === 'test' ||
  env.NODE_ENV === 'local' ||
  env.NODE_ENV === 'stg'
) {
  /**
   * @swagger
   * /env:
   *   get:
   *     tags:
   *       - /
   *     summary: Get the environment variables
   *     responses:
   *       200:
   *         description: The environment variables
   */
  appRouter.get('/env', (_req, res) => {
    res.json(env);
  });
}

appRouter.use('/api/profile', profileRouter);

export default appRouter;
