import axios, { AxiosRequestConfig } from 'axios';
import jwt from 'jsonwebtoken';

import { APP } from '@util/constants';

interface JwtGoogleToken {
  email: string;
}

/**
 * Returns the decoded JwtGoogleToken including the email of the User. Uses
 * the standard OAuth code-token exchange.
 *
 * @param code - Code from auth callback to exchange for Google API token.
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
