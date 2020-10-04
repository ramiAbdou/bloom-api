/**
 * @fileoverview Service: GoogleAuth
 * @author Rami Abdou
 */

import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

import { GOOGLE } from '@constants';
import { GoogleTokens } from './GoogleTypes';

export default class GoogleAuth {
  /**
   * Exchanges the given code for an ID token from the Google API. We then
   * decode the token and return the email stored in the decoded JWT.
   *
   * @param code Code from authorization callback that we need to exchange for
   * a token from the Google API.
   */
  getTokens = async (code: string): Promise<GoogleTokens> => {
    const TOKEN_EXCHANGE_URL =
      `https://oauth2.googleapis.com/token` +
      `?code=${code}` +
      `&grant_type=authorization_code` +
      `&redirect_uri=${GOOGLE.REDIRECT_URI}` +
      `&client_id=${GOOGLE.CLIENT_ID}` +
      `&client_secret=${GOOGLE.CLIENT_SECRET}`;

    return (await axios.post(TOKEN_EXCHANGE_URL)).data;
  };

  /**
   * Returns an updated access token (and ID token) using the given long-lived
   * refresh token.
   */
  getRefreshedToken = async (refreshToken: string) => {
    const REFRESH_TOKEN_URL =
      `https://oauth2.googleapis.com/token` +
      '?grant_type=refresh_token' +
      `&refresh_token=${refreshToken}` +
      `&client_id=${GOOGLE.CLIENT_ID}` +
      `&client_secret=${GOOGLE.CLIENT_SECRET}`;

    return (await axios.post(REFRESH_TOKEN_URL)).data;
  };

  /**
   * Returns an updated access token (and ID token) using the given long-lived
   * refresh token.
   */
  validateToken = async (idToken: string): Promise<boolean> => {
    try {
      return !!(await new OAuth2Client(GOOGLE.CLIENT_ID).verifyIdToken({
        audience: GOOGLE.CLIENT_ID,
        idToken
      }));
    } catch {
      return false;
    }
  };
}
