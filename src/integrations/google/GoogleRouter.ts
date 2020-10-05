/**
 * @fileoverview Router: Google
 * @author Rami Abdou
 */

import { Request, Response } from 'express';
import decode from 'jwt-decode';

import { APP, isProduction, JWT, Route } from '@constants';
import { User } from '@entities/entities';
import Auth from '@util/auth/Auth';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import GoogleAuth from './GoogleAuth';
import { DecodedGoogleIDToken } from './GoogleTypes';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.retrieveToken, method: 'GET', route: '/auth' }];
  }

  private async retrieveToken({ query }: Request, res: Response) {
    const idToken = await new GoogleAuth().getIdToken(query.code as string);
    const { email } = decode(idToken) as DecodedGoogleIDToken;

    const bm = new BloomManager();
    const user: User = await bm.userRepo().findOne({ email });

    // If the user isn't found, then direct them back to the login page with
    // the error code, so that React can display the correct error message.
    if (!user) {
      res.redirect(`${APP.CLIENT_URL}/login?err=user_not_found`);
      return;
    }

    const { token, refreshToken } = new Auth().generateTokens({
      userId: user.id
    });
    user.refreshToken = refreshToken;
    await bm.flush(`Refresh token stored for ${user.fullName}.`);

    const options = { httpOnly: true, secure: isProduction };
    res.cookie('token', token, { ...options, maxAge: JWT.EXPIRES_IN });
    res.cookie('refreshToken', refreshToken, options);
    res.redirect(APP.CLIENT_URL);
  }
}
