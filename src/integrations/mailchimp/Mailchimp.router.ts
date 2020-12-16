import { Request, Response } from 'express';

import { APP, AuthQueryParams } from '@constants';
import Router, { Route } from '@core/Router';
import storeMailchimpToken from '@entities/community-integrations/repo/storeMailchimpToken';

export default class MailchimpRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query as AuthQueryParams;

    await storeMailchimpToken(encodedUrlName, code);

    res.redirect(
      `${APP.CLIENT_URL}/${encodedUrlName}/integrations?flow=mailchimp`
    );
  }
}
