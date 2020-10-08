/**
 * @fileoverview Router: Zoom
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import { Community } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import ZoomAuth from './ZoomAuth';

export default class ZoomRouter extends Router {
  get routes(): Route[] {
    return [
      { callback: this.handleAuth, method: 'GET', route: '/auth' },
      { callback: this.onEvent, method: 'POST', route: '/events' }
    ];
  }

  private async onEvent({ query }: Request, res: Response) {}

  /**
   * Catches the Authorization code from the Zoom API and exchanges it for an
   * accessToken, refreshToken which we store in the Community entity and send
   * back via httpOnly cookies.
   */
  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query;
    const bm = new BloomManager();

    // Fetch the accessToken and refreshToken from the Zoom API and set them as
    // httpOnly cookies so that the user can use the accessToken immediately.
    const {
      accessToken,
      refreshToken
    } = await new ZoomAuth().getTokensFromCode(code as string);

    // The state param stores a community's encodedUrlName, so we find them
    // in our DB.
    const community: Community = await bm
      .communityRepo()
      .findOne({ encodedUrlName: encodedUrlName as string });

    // If that community doesn't exist, then we don't persist the tokens in the
    // DB and instead we redirect them to the React app.
    if (!community) {
      res.redirect(`${APP.CLIENT_URL}?err=community_not_found`);
      return;
    }

    // Otherwise, store the tokens in our DB!
    community.zoomAccessToken = accessToken;
    community.zoomRefreshToken = refreshToken;
    await bm.flush(`Zoom tokens stored for ${community.name}.`);

    res.redirect(APP.CLIENT_URL);
  }
}
