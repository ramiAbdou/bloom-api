/**
 * @fileoverview Router: Google
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, isProduction, JWT, Route } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const tokens = await new BloomManager()
      .userRepo()
      .storeGoogleRefreshToken(query.code as string);

    // If the user isn't found, then direct them back to the login page with
    // the error code, so that React can display the correct error message.
    if (!tokens) {
      res.redirect(`${APP.CLIENT_URL}/login?err=user_not_found`);
      return;
    }

    const { accessToken, refreshToken } = tokens;
    const options = { httpOnly: true, secure: isProduction };
    res.cookie('accessToken', accessToken, {
      ...options,
      maxAge: JWT.EXPIRES_IN
    });
    res.cookie('refreshToken', refreshToken, options);
    res.redirect(APP.CLIENT_URL);
  }
}
