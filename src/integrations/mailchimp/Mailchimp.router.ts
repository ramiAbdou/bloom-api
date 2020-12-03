import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

export default class MailchimpRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query;

    await new BloomManager()
      .communityIntegrationsRepo()
      .storeMailchimpTokenFromCode(encodedUrlName as string, code as string);

    res.redirect(
      `${APP.CLIENT_URL}/${encodedUrlName}/integrations?flow=mailchimp`
    );
  }
}
