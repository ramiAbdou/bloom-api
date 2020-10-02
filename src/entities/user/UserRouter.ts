/**
 * @fileoverview Router: User
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

class UserRouter extends Router {
  get routes(): Route[] {
    return [
      { callback: this.verifyEmail, method: 'GET', route: '/:userId/validate' }
    ];
  }

  private async verifyEmail(request: Request, response: Response) {
    const bm = new BloomManager();
    const { userId } = request.params;

    const user: User = await bm.userRepo().findOne({ id: userId });
    user.verified = true;
    await bm.flush(`${user.firstName} verfied their email.`, { user });

    response.redirect(APP.CLIENT_URL);
  }
}

export default new UserRouter().router;
