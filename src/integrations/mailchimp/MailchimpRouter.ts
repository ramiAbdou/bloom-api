/**
 * @fileoverview Router: Mailchimp
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { APP, Route } from '@constants';
import { Community } from '@entities/entities';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';
import MailchimpAuth from './MailchimpAuth';

export default class MailchimpRouter extends Router {
  get routes(): Route[] {
    return [{ callback: this.handleAuth, method: 'GET', route: '/auth' }];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedURLName } = query;

    // The state param stores a community's encodedURLName, so we find them
    // in our DB.
    const bm = new BloomManager();
    const community: Community = await bm
      .communityRepo()
      .findOne({ encodedURLName: encodedURLName as string });

    // If that community doesn't exist, then we don't persist the tokens in the
    // DB and instead we redirect them to the React app.
    if (!community) {
      res.redirect(`${APP.CLIENT_URL}?err=community_not_found`);
      return;
    }

    const accessToken = await new MailchimpAuth().getTokenFromCode(
      code as string
    );

    // Otherwise, store the tokens in our DB!
    community.mailchimpAccessToken = accessToken;
    await bm.flush(`Mailchimp token stored for ${community.name}.`);

    res.redirect(APP.CLIENT_URL);
  }
}
