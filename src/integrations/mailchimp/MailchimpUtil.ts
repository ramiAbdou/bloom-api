/**
 * @fileoverview Service: MailchimpAuth
 * @author Rami Abdou
 * @see https://mailchimp.com/developer/guides/access-user-data-with-oauth-2/
 */

import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, isProduction } from '@constants';

// All the other redirect URIs use localhost when in development, but Mailchimp
// forces us to use 127.0.0.1 instead, so we can't use the APP.SERVER_URL local
// URL.
const BASE_URI = isProduction ? APP.SERVER_URL : 'http://127.0.0.1:8080';

/**
 * Returns the accessToken (which according to the Mailchimp API never expires
 * and thus we don't need a refresh token).
 */
export const getTokenFromCode = async (code: string): Promise<string> => {
  const options: AxiosRequestConfig = {
    data: new URLSearchParams({
      client_id: process.env.MAILCHIMP_CLIENT_ID,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BASE_URI}/mailchimp/auth`
    }),
    method: 'POST',
    url: 'https://login.mailchimp.com/oauth2/token'
  };

  const { data } = await axios(options);
  return data.access_token;
};
