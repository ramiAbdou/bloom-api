/**
 * @fileoverview Router: Google
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, isProduction, JWT, Route } from '@constants';
import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import { generateTokens } from '@util/util';
import GoogleAuth from './GoogleAuth';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const bm = new BloomManager();
    const user: User = await bm.userRepo().findOne({
      email: await new GoogleAuth().getEmailFromCode(query.code as string)
    });

    // If the user isn't found, then direct them back to the login page with
    // the error code, so that React can display the correct error message.
    if (!user) {
      res.redirect(`${APP.CLIENT_URL}/login?err=user_not_found`);
      return;
    }

    const { token, refreshToken } = generateTokens({ userId: user.id });
    user.refreshToken = refreshToken;
    await bm.flush(`Refresh token stored for ${user.fullName}.`);

    const options = { httpOnly: true, secure: isProduction };
    res.cookie('token', token, { ...options, maxAge: JWT.EXPIRES_IN });
    res.cookie('refreshToken', refreshToken, options);
    res.redirect(APP.CLIENT_URL);
  }
}
