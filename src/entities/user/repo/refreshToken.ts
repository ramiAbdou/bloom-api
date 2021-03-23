import { Response } from 'express';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import createMemberRefresh from '@entities/member-refresh/repo/createMemberRefresh';
import Member from '@entities/member/Member';
import { AuthTokens, JWT } from '@util/constants';
import { FlushEvent, VerifyEvent } from '@util/constants.events';
import { signToken } from '@util/util';
import User from '../User';

interface RefreshTokenArgs {
  email?: string;
  googleId?: string;
  memberId?: string;
  rToken?: string;
  res?: Response;
  userId?: string;
}

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided.
 *
 * @param args.email - Email of User to refresh.
 * @param args.googleId - Google ID of User to refresh.
 * @param args.memberId - ID of the Member to refresh.
 * @param args.rToken - Refresh token of User to refresh.
 * @param args.res - Express Response object.
 * @param args.userId - ID of the User to refresh.
 */
const refreshToken = async (args: RefreshTokenArgs): Promise<AuthTokens> => {
  const { email, googleId, memberId, res, rToken, userId } = args;

  if (!email && !googleId && !memberId && !rToken && !userId) return null;

  let queryArgs: FilterQuery<User>;

  if (googleId) queryArgs = { googleId };
  else if (userId) queryArgs = { id: userId };
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
    userId: user.id,
    ...(email ? { event: VerifyEvent.LOG_IN } : {})
  };

  const tokens: AuthTokens = {
    accessToken: signToken({ payload }),
    refreshToken: signToken({ expires: false, payload })
  };

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) {
    const options = {
      httpOnly: true,
      secure: process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'prod'
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...options,
      maxAge: JWT.EXPIRES_IN * 1000 // x1000 because represented as milliseconds.
    });

    res.cookie('refreshToken', tokens.refreshToken, options);
  }

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;
  await bm.flush({ flushEvent: FlushEvent.UPDATE_REFRESH_TOKEN });
  await createMemberRefresh({ memberId: member.id });

  return tokens;
};

export default refreshToken;
