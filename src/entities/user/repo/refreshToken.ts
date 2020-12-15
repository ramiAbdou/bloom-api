import { Response } from 'express';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import MemberRefresh from '../../member-refresh/MemberRefresh';
import User from '../User';

type RefreshTokenArgs = {
  communityId?: string;
  refreshToken?: string;
  res?: Response;
  user?: User;
  userId?: string;
};

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided. If the refreshing succeeds, the tokenw il
 */
export default async ({
  communityId,
  refreshToken,
  res,
  user,
  userId
}: RefreshTokenArgs): Promise<AuthTokens> => {
  const bm = new BloomManager();

  if (user) bm.em.merge(user);
  else {
    user = await bm.findOne(User, { $or: [{ id: userId }, { refreshToken }] });
  }

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  const tokens = generateTokens({ userId: user.id });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;

  if (communityId) {
    await bm.em.populate(user, 'members', {
      members: { community: { id: communityId } }
    });
  } else if (!user.members.isInitialized()) {
    await bm.em.populate(user, 'members');
  }

  const member = user.members[0];
  bm.create(MemberRefresh, { member });

  await bm.flush('REFRESH_TOKEN_UPDATED');

  return tokens;
};
