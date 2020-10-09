/**
 * @fileoverview Router: Zoom
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import { Community } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

export default class ZoomRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  /**
   * Catches the Authorization code from the Zoom API and exchanges it for an
   * accessToken, refreshToken which we store in the Community entity and send
   * back via httpOnly cookies.
   */
  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query;
    const community: Community = await new BloomManager()
      .communityRepo()
      .storeZoomTokens(encodedUrlName as string, code as string);

    // If that community doesn't exist, then we don't persist the tokens in the
    // DB and instead we redirect them to the React app.
    if (!community) res.redirect(`${APP.CLIENT_URL}?err=community_not_found`);
    else res.redirect(APP.CLIENT_URL);
  }
}
