/**
 * @fileoverview Types: Google
 * @author Rami Abdou
 */

export type DecodedGoogleIDToken = { email: string };

export type GoogleTokens = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
};
