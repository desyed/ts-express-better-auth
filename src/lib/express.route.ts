import type { Request, Response, RequestHandler, Router } from 'express';

import express from 'express';

/**
 * RouteDefinition with correctly typed children to enable deep auto-completion.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RouteDefinition<
  TChildren extends Record<string, RouteDefinition<TChildren>> = {},
> {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  label: string;
  handler?: RequestHandler | RequestHandler[];
  children?: TChildren;
}

/**
 * defineRoutes locks in the object structure to maintain full TypeScript auto-completion.
 */
export const defineRoutes = <T extends Record<string, RouteDefinition>>(
  routes: T
): T => routes;

/**
 * Recursively registers routes (and nested child routes) on a router.
 * If no router is provided, one is automatically created.
 * The handler can be a single function or an array of functions.
 *
 * @param routes - The routes to register.
 * @param router - (Optional) An Express router. If omitted, one is created.
 * @param parentPath - (Internal) The accumulated path for nested routes.
 * @returns The router with the registered routes.
 */
export function registerRoutes(
  routes: Record<string, RouteDefinition>,
  router: Router = express.Router(),
  parentPath: string = ''
): Router {
  Object.entries(routes).forEach(([_key, route]) => {
    const { path, method, label, handler, children } = route;
    const fullPath = `${parentPath}${path}`;

    // Normalize the handler to an array of RequestHandler
    const validHandlers: RequestHandler[] = Array.isArray(handler)
      ? handler
      : handler
        ? [handler]
        : [
            (_req: Request, res: Response): void => {
              res.send(`Handling ${label}`);
            },
          ];

    // Register the route with the spread array of handlers
    (router[method] as (path: string, ...handlers: RequestHandler[]) => void)(
      fullPath,
      ...validHandlers
    );
    // eslint-disable-next-line no-console
    console.log(`Registered: ${method.toUpperCase()} ${fullPath}`);

    // Recursively register nested child routes, if any.
    if (children) {
      registerRoutes(children, router, fullPath);
    }
  });
  return router;
}
