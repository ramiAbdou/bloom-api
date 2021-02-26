import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, AuthQueryArgs, isProduction } from '@util/constants';

const getMailchimpAccessToken = async ({
  code
}: AuthQueryArgs): Promise<string> => {
  // All the other redirect URIs use localhost when in development, but
  // Mailchimp forces us to use 127.0.0.1 instead, so we can't use the
  // APP.SERVER_URL local URL.
  const BASE_URI = isProduction ? APP.SERVER_URL : 'http://127.0.0.1:8080';

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

  const resposne = await axios(options);

  return resposne.data?.access_token;
};

export default getMailchimpAccessToken;
