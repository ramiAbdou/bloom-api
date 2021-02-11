import { Response } from 'express';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import createMemberRefresh from '../../member-refresh/createMemberRefresh';
import User from '../User';
import switchMember from './switchMember';

interface RefreshTokenArgs {
  email?: string;
  memberId?: string;
  rToken?: string;
  res?: Response;
  userId?: string;
}

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided. If the refreshing succeeds, the tokenw il
 */
const refreshToken = async ({
  memberId,
  res,
  ...userArgs
}: RefreshTokenArgs): Promise<AuthTokens> => {
  const bm = new BloomManager();
  const user: User = await switchMember({ ...userArgs, memberId });

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  bm.em.merge(user);

  const tokens = generateTokens({
    communityId: user.member.community.id,
    memberId: user.member.id,
    userId: user.id
  });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;
  await bm.flush({ event: 'UPDATE_REFRESH_TOKEN' });
  await createMemberRefresh({ memberId: user.member.id });

  return tokens;
};

export default refreshToken;
