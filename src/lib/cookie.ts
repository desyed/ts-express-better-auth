import type { Response } from 'express';

import env from '@/config/env';

export async function setIdTokenCookie(idToken: string, res: Response) {
  res.cookie('gd_idToken', idToken, {
    path: '/',
    domain: env.NODE_ENV === 'local' ? 'localhost' : `.${env.DOMAIN}`,
    maxAge: 1000 * 60 * 30,
    secure: env.NODE_ENV !== 'local',
    sameSite: 'lax',
  });
}
