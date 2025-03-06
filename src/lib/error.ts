import type { NextFunction } from 'express';
import type { Request, Response } from 'express';

import { logger } from '@/lib/logger';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err?.status >= 500) {
    logger.error(err);
  } else if (err?.status > 400) {
    logger.warn(err);
  } else if (err?.status >= 300) {
    logger.info(err);
  }
  res.status(err?.status ?? 500);
  res.json({
    message: err?.message ?? 'Internal Server Error',
    status: err?.status ?? 500,
  });
  next();
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404);
  res.json({
    message: 'Not Found',
    status: 404,
    path: req.path,
  });
}
