import axios, { AxiosRequestConfig } from 'axios';
import jwt from 'jsonwebtoken';

import { APP } from '@constants';

type DecodedIdToken = { email: string };

/**
 * Exchanges the given code for an ID token from the Google API. We then
 * decode the token and return the email stored in the decoded JWT.
 *
 * @param code Code from authorization callback that we need to exchange for
 * a token from the Google API.
 */
export const getEmailFromCode = async (code: string): Promise<string> => {
  const options: AxiosRequestConfig = {
    method: 'POST',
    params: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${APP.SERVER_URL}/google/auth`
    },
    url: 'https://oauth2.googleapis.com/token'
  };

  const { data } = await axios(options);
  const { email } = jwt.decode(data.id_token) as DecodedIdToken;
  return email;
};
