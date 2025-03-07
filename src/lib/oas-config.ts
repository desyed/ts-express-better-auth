import type { Express } from 'express';
import type { OAS3Options } from 'swagger-jsdoc';

import { apiReference } from '@scalar/express-api-reference';
import swaggerJsdoc from 'swagger-jsdoc';

import env from '@/config/env';

const options: OAS3Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'TS EXPRESS Better Auth',
      version: '1.0.0',
    },
    security: [
      {
        cookieAuth: [],
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: env.BASE_URL,
        description: 'The API server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionId',
          description: 'Session-based authentication using cookies',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer authentication using JWT',
        },
      },
    },
  },
  apis: ['./src/app/index.ts', './src/app/**/*.routes.ts'],
};

const openapiSpec = swaggerJsdoc(options);

export function configureOAS(app: Express) {
  app.get('/openapi.json', (_req, res) => {
    res.json(openapiSpec);
  });
  app.use(
    '/docs',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    apiReference({
      theme: 'kepler',
      layout: 'classic',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      spec: {
        url: '/openapi.json',
      },
      pageTitle: 'TS EXPRESS Better Auth',
    })
  );
}
