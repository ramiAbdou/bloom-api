import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, AuthQueryArgs, isDevelopment } from '@util/constants';

/**
 * Returns the Mailchimp access token.
 *
 * @param args.code - Code to exchange for token from Mailchimp API.
 */
const getMailchimpAccessToken = async (
  args: AuthQueryArgs
): Promise<string> => {
  const { code } = args;

  // All the other redirect URIs use localhost when in development, but
  // Mailchimp forces us to use 127.0.0.1 instead, so we can't use the
  // APP.SERVER_URL local URL.
  const BASE_URI: string = !isDevelopment
    ? APP.SERVER_URL
    : 'http://127.0.0.1:8080';

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

  const response = await axios(options);

  return response.data?.access_token;
};

export default getMailchimpAccessToken;
