/**
 * @fileoverview Utility: Auth
 * @author Rami Abdou
 */

import jwt from 'jsonwebtoken';

import { JWT } from '@constants';
import { AuthTokens } from './AuthTypes';

export default class Auth {
  /**
   * Generates and signs both a token and refreshToken. The refreshToken does
   * not expire, but the token expires after a limited amount of time.
   */
  generateTokens = (payload: string | object): AuthTokens => ({
    refreshToken: jwt.sign(payload, JWT.SECRET),
    token: jwt.sign(payload, JWT.SECRET, { expiresIn: JWT.EXPIRES_IN })
  });

  /**
   * Returns true if the token is both a valid JWT token and if it has not yet
   * expired.
   */
  verifyToken = (token: string): boolean => {
    try {
      return !!jwt.verify(token, JWT.SECRET);
    } catch {
      return false;
    }
  };
}
