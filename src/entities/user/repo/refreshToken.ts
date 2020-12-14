import { Response } from 'express';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import User from '../User';

type RefreshTokenFlowArgs = { res?: Response; user?: User; userId?: string };

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided. If the refreshing succeeds, the tokenw il
 */
export default async ({
  res,
  user,
  userId
}: RefreshTokenFlowArgs): Promise<AuthTokens> => {
  const bm = new BloomManager();
  user = user ?? (await bm.findOne(User, { id: userId }));

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  const tokens = generateTokens({ userId: user.id });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB.
  user.refreshToken = tokens.refreshToken;
  await bm.flush('REFRESH_TOKEN_STORED');

  return tokens;
};
