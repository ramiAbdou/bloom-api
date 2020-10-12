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
    const options: AxiosRequestConfig = {
      headers: { Authorization: `Basic ${this.getBase64AuthString()}` },
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

  refreshAccessToken = async (refreshToken: string): Promise<ZoomTokens> => {
    const options: AxiosRequestConfig = {
      headers: { Authorization: `Basic ${this.getBase64AuthString()}` },
      method: 'POST',
      params: { grant_type: 'refresh_token', refresh_token: refreshToken },
      url: 'https://zoom.us/oauth/token'
    };

    const { data } = await axios(options);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  };

  /**
   * Returns the base64 authorization string that uses both the Zoom Client ID
   * and Zoom Client Secret.
   */
  private getBase64AuthString = (): string =>
    Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');
}
