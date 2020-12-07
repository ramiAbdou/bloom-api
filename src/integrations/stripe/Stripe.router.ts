import { Request, Response } from 'express';

import { APP, AuthQueryParams, Route } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Router from '@core/Router';

export default class StripeRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query as AuthQueryParams;

    await new BloomManager()
      .communityIntegrationsRepo()
      .storeStripeTokensFromCode(encodedUrlName, code);

    res.redirect(`${APP.CLIENT_URL}/${encodedUrlName}/integrations`);
  }
}
