import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Router from '@core/Router';

export default class StripeRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query;

    await new BloomManager()
      .communityIntegrationsRepo()
      .storeStripeTokensFromCode(encodedUrlName as string, code as string);

    res.redirect(`${APP.CLIENT_URL}/${encodedUrlName}/integrations`);
  }
}
