/**
 * @fileoverview Service: ZoomAuth
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig } from 'axios';

import { APP } from '@constants';
import { ZoomTokens } from './ZoomTypes';

export default class ZoomAuth {
  /**
   * Exchanges the given code for an access and refresh token from the Zoom API.
   *
   * @param code Code from authorization callback that we need to exchange for
   * a token from the Google API.
   */
  getTokensFromCode = async (code: string): Promise<ZoomTokens> => {
    const base64AuthString = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const options: AxiosRequestConfig = {
      headers: { Authorization: `Basic ${base64AuthString}` },
      method: 'POST',
      params: {
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP.SERVER_URL}/zoom/auth`
      },
      url: 'https://zoom.us/oauth/token'
    };

    const { data } = await axios(options);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  };
}
