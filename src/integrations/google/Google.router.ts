/**
 * @fileoverview Router: Google
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, LoginError, Route } from '@constants';
import { User } from '@entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import { getEmailFromCode } from './Google.util';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const email = await getEmailFromCode(query.code as string);

    const userRepo = new BloomManager().userRepo();
    const user: User = await userRepo.findOne({ email }, ['memberships']);

    const loginError: LoginError = await userRepo.getLoginStatusError(user);
    if (loginError) res.cookie('LOGIN_ERROR', loginError);
    else await userRepo.refreshTokenFlow({ email, res });

    res.redirect(APP.CLIENT_URL);
  }
}
