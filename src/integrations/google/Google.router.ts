import { Request, Response } from 'express';

import { APP, LoginError, Route } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Router from '@core/Router';
import { Member, User } from '@entities/entities';
import updateInvitedStatuses from '@entities/member/actions/updateInvitedStatus';
import { getEmailFromCode } from './Google.util';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const bm = new BloomManager();
    const userRepo = bm.userRepo();
    const email = await getEmailFromCode(query.code as string);
    const user: User = await userRepo.findOne({ email }, ['members']);
    const loginError: LoginError = await userRepo.getLoginStatusError(user);

    if (loginError) res.cookie('LOGIN_ERROR', loginError);
    else {
      const members: Member[] = user.members.getItems();

      // If when trying to login, the user has some a status of INVITED (only
      // possible if an admin added them manually), then we should set those
      // statuses to be ACCEPTED.
      if (members.some(({ status }) => status === 'INVITED')) {
        await updateInvitedStatuses(members);
      }

      await userRepo.refreshTokenFlow({ res, user });
    }

    res.redirect(APP.CLIENT_URL);
  }
}
