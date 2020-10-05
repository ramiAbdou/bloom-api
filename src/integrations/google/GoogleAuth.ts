/**
 * @fileoverview Service: GoogleAuth
 * @author Rami Abdou
 */

import axios from 'axios';

import { GOOGLE } from '@constants';

export default class GoogleAuth {
  /**
   * Exchanges the given code for an ID token from the Google API. We then
   * decode the token and return the email stored in the decoded JWT.
   *
   * @param code Code from authorization callback that we need to exchange for
   * a token from the Google API.
   */
  getIdToken = async (code: string): Promise<string> => {
    const TOKEN_EXCHANGE_URL =
      `https://oauth2.googleapis.com/token` +
      `?code=${code}` +
      `&grant_type=authorization_code` +
      `&redirect_uri=${GOOGLE.REDIRECT_URI}` +
      `&client_id=${GOOGLE.CLIENT_ID}` +
      `&client_secret=${GOOGLE.CLIENT_SECRET}`;

    return (await axios.post(TOKEN_EXCHANGE_URL)).data.id_token;
  };
}
