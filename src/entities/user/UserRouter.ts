/**
 * @fileoverview Router: User
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

export default class UserRouter extends Router {
  get routes(): Route[] {
    return [
      { callback: this.verifyEmail, method: 'GET', route: '/:userId/verify' }
    ];
  }

  private async verifyEmail(request: Request, response: Response) {
    await new BloomManager().userRepo().verifyEmail(request.params.userId);
    response.redirect(APP.CLIENT_URL);
  }
}
