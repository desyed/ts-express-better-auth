import type { TOrgStatus } from '@/database/schema';
import type { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

import 'express';
import 'node:util/types';

export type AuthPayload = CognitoIdTokenPayload & {
  email: string;
  name: string;
};

export type SessionPayload = {
  iss: string;
  sub: string;
  expires: number;
  avatar: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      authContext: AuthPayload;
      session: SessionPayload;
    }
    // interface Response {
    // }
  }
  let PORT: number;
}
