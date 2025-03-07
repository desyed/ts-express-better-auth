import type { HelmetOptions } from 'helmet';

export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
    },
  },
  xPoweredBy: false,
} satisfies HelmetOptions;
