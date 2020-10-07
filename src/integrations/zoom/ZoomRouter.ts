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
    return [{ callback: this.retrieveTokens, method: 'GET', route: '/auth' }];
  }

  private async retrieveTokens({ query }: Request, res: Response) {
    const { code, state: encodedURLName } = query;
    const bm = new BloomManager();
    const community: Community = await bm
      .communityRepo()
      .findOne({ encodedURLName: encodedURLName as string });

    if (!community) {
      res.redirect(`${APP.CLIENT_URL}?err=community_not_found`);
      return;
    }

    const tokens = await new ZoomAuth().getTokenFromCode(code as string);
    community.zoomAccessToken = tokens.accessToken;
    community.zoomRefreshToken = tokens.refreshToken;
    await bm.flush(`Zoom tokens stored for ${community.name}.`);
    res.redirect(APP.CLIENT_URL);
  }
}
