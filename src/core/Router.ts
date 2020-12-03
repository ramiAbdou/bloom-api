import { Router as ExpressRouter } from 'express';

import { Route } from '@constants';

/**
 * Binds the given routes to the Express Router. Must override the routes
 * getter, which defines the available routes for the given router.
 */
export default abstract class Router {
  public router: ExpressRouter;

  constructor() {
    this.router = ExpressRouter();
    this.bindRoutes();
  }

  /**
   * @abstract Subclasses MUST override this function. Should specify a list
   * of routes that will live on this router.
   */
  abstract get routes(): Route[];

  /**
   * Iterate through the routes and bind the route, callback and method to the
   * Express Router object.
   */
  private bindRoutes() {
    this.routes.forEach(({ callback, method, route }: Route) => {
      const expressMethod = method.toLowerCase();
      this.router[expressMethod](route, callback.bind(this));
    });
  }
}
