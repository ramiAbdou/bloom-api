import { Request, Response } from 'express';

import { APP, LoginError, Route } from '@constants';
import { Membership, User } from '@entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import { getEmailFromCode } from './Google.util';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const bm = new BloomManager();
    const userRepo = bm.userRepo();
    const email = await getEmailFromCode(query.code as string);
    const user: User = await userRepo.findOne({ email }, ['memberships']);
    const loginError: LoginError = await userRepo.getLoginStatusError(user);

    if (loginError) res.cookie('LOGIN_ERROR', loginError);
    else {
      const memberships: Membership[] = user.memberships.getItems();
      if (memberships.some(({ status }) => status === 'INVITED')) {
        await bm.membershipRepo().updateInvitedStatuses(memberships);
      }

      await userRepo.refreshTokenFlow({ res, user });
    }

    res.redirect(APP.CLIENT_URL);
  }
}
