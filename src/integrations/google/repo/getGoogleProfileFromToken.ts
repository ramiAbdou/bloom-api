import axios, { AxiosRequestConfig } from 'axios';
import { google, oauth2_v2 } from 'googleapis';

import { APP } from '@util/constants';

/**
 * Returns the decoded including the email of the User. Uses
 * the standard OAuth code-token exchange.
 *
 * @param code - Code from auth callback to exchange for Google API token.
 */
const getGoogleProfileFromToken = async (
  code: string
): Promise<oauth2_v2.Schema$Userinfoplus> => {
  // Initializes the Google Auth library with the clientId and clientSecret.
  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  });

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

  // Exchange the "code" for tokens from the Google API.
  const { data: credentials } = await axios(options);

  // Update the Google auth with these credentials so we can fetch the
  // appropriate user information with the updated tokens.
  auth.setCredentials(credentials);

  const oauth2: oauth2_v2.Oauth2 = google.oauth2({ auth, version: 'v2' });
  const { data: profile } = await oauth2.userinfo.get();

  // We want to make the picture 400 x 400 (by default Google makes it 96 x 96).
  profile.picture = profile.picture.replace('s96-c', 's400-c');

  return profile;
};

export default getGoogleProfileFromToken;
