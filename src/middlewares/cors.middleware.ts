import cors from 'cors';

import { sessionOrigins } from '@/config/cors';

export const allowAllOrigins = cors({
  origin: '*',
});

export const allowSessionOrigins = cors({
  origin: sessionOrigins,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
