/**
 * @fileoverview Router: Mailchimp
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import { Community } from '@entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

export default class MailchimpRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query;
    const community: Community = await new BloomManager()
      .communityRepo()
      .storeMailchimpToken(encodedUrlName as string, code as string);

    if (!community) res.redirect(`${APP.CLIENT_URL}?err=community_not_found`);
    else res.redirect(APP.CLIENT_URL);
  }
}
