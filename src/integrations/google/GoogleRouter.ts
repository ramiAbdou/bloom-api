/**
 * @fileoverview Router: Google
 * @author Rami Abdou
 */

import { Request, Response } from 'express';
import decode from 'jwt-decode';

import { APP, isProduction, Route } from '@constants';
import { User } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import GoogleAuth from './GoogleAuth';
import { DecodedGoogleIDToken } from './GoogleTypes';

export default class GoogleRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.retrieveToken, method: 'GET', route: '/auth' }];
  }

  private async retrieveToken({ query }: Request, res: Response) {
    const bm = new BloomManager();
    const {
      expires_in: expiresIn, // Represented as seconds, need to * 1000 for ms.
      id_token: idToken,
      refresh_token: refreshToken
    } = await new GoogleAuth().getTokens(query.code as string);

    const user: User = await bm
      .userRepo()
      .findOne({ email: (decode(idToken) as DecodedGoogleIDToken).email });

    // If the user isn't found, then direct them back to the login page with
    // the error code, so that React can display the correct error message.
    // if (!user) {
    //   res.redirect(`${APP.CLIENT_URL}/login?err=user_not_found`);
    //   return;
    // }

    // user.refreshToken = refreshToken;
    // await bm.flush(`Refresh token stored for ${user.fullName}.`);

    const options = { httpOnly: true, secure: isProduction };
    res.cookie('idToken', idToken, { ...options, maxAge: expiresIn * 1000 });
    res.cookie('refreshToken', refreshToken, options);
    res.redirect(APP.CLIENT_URL);
  }
}
