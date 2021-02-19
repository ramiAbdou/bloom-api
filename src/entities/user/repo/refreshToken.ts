import { Response } from 'express';
import { FilterQuery } from '@mikro-orm/core';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import createMemberRefresh from '../../member-refresh/repo/createMemberRefresh';
import Member from '../../member/Member';
import User from '../User';

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
  email,
  memberId,
  res,
  rToken,
  userId
}: RefreshTokenArgs): Promise<AuthTokens> => {
  let args: FilterQuery<User>;

  if (userId) args = { id: userId };
  else if (email) args = { email };
  else if (rToken) args = { refreshToken: rToken };

  const bm = new BloomManager();

  const user: User = await bm.findOne(User, args);

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) {
    if (res) res.clearCookie('accessToken', 'refreshToken');
    return null;
  }

  let member: Member;

  if (memberId) member = await bm.findOne(Member, { id: memberId });
  else {
    await user.members.init();
    member = user.members[0];
  }

  bm.em.merge(user);

  const tokens = generateTokens({
    communityId: member.community.id,
    memberId: member.id,
    userId: user.id
  });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;
  await bm.flush({ flushEvent: FlushEvent.UPDATE_REFRESH_TOKEN });
  await createMemberRefresh({ memberId: member.id });

  return tokens;
};

export default refreshToken;
