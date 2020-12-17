import { Response } from 'express';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import MemberRefresh from '../../member-refresh/MemberRefresh';
import Member from '../../member/Member';
import User from '../User';

type RefreshTokenArgs = {
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
  refreshToken,
  res,
  user,
  userId
}: RefreshTokenArgs): Promise<AuthTokens> => {
  const bm = new BloomManager();

  if (user) bm.em.merge(user);
  else {
    user = await bm.findOne(
      User,
      { $or: [{ id: userId }, { refreshToken }] },
      { populate: ['members'] }
    );
  }

  const member: Member = user.members[0];
  await bm.em.populate(member, 'community');
  const communityId = member.community.id;

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  const tokens = generateTokens({
    communityId,
    memberId: member.id,
    userId: user.id
  });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;

  bm.create(MemberRefresh, { member });
  await bm.flush('REFRESH_TOKEN_UPDATED');

  return tokens;
};
