import axios, { AxiosRequestConfig } from 'axios';
import jwt from 'jsonwebtoken';

import { APP } from '@constants';

interface JwtGoogleToken {
  email: string;
}

/**
 * Exchanges the given code for an ID token from the Google API. We then
 * decode the token and return the email stored in the decoded JWT.
 *
 * @param code Code from authorization callback that we need to exchange for
 * a token from the Google API.
 */
const getGoogleToken = async (code: string): Promise<JwtGoogleToken> => {
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
  return jwt.decode(data.id_token) as JwtGoogleToken;
};

export default getGoogleToken;
