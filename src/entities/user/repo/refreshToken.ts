import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import createMemberRefresh from '@entities/member-refresh/repo/createMemberRefresh';
import Member from '@entities/member/Member';
import { AuthTokens, JWT } from '@util/constants';
import { MutationEvent } from '@util/events';
import { setHttpOnlyTokens } from '@util/util';
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
 * res object is provided.
 *
 * @param {RefreshTokenArgs} args
 * @param {string} [args.email]
 * @param {string} [args.memberId]
 * @param {string} [args.rToken]
 * @param {string} [args.res]
 * @param {string} [args.userId]
 */
const refreshToken = async (args: RefreshTokenArgs): Promise<AuthTokens> => {
  const { email, memberId, res, rToken, userId } = args;

  if (!email && !memberId && !rToken && !userId) return null;

  let queryArgs: FilterQuery<User>;

  if (userId) queryArgs = { id: userId };
  else if (email) queryArgs = { email };
  else if (rToken) queryArgs = { refreshToken: rToken };
  else if (memberId) queryArgs = { members: { id: memberId } };

  const bm = new BloomManager();

  const user: User = await bm.findOne(User, queryArgs);

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

  const payload = {
    communityId: member.community.id,
    memberId: member.id,
    userId: user.id
  };

  const tokens: AuthTokens = {
    accessToken: jwt.sign(payload, JWT.SECRET, { expiresIn: JWT.EXPIRES_IN }),
    refreshToken: jwt.sign(payload, JWT.SECRET)
  };

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_REFRESH_TOKEN });
  await createMemberRefresh({ memberId: member.id });

  return tokens;
};

export default refreshToken;
