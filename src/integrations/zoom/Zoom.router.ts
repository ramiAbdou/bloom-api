import { Request, Response } from 'express';

import { APP, AuthQueryParams, Route } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Router from '@core/Router';

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
    const { code, state: encodedUrlName } = query as AuthQueryParams;

    await new BloomManager()
      .communityIntegrationsRepo()
      .storeZoomTokensFromCode(encodedUrlName, code);

    res.redirect(`${APP.CLIENT_URL}/${encodedUrlName}/integrations`);
  }
}
