import { Response } from 'express';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
// import createMemberRefresh from '@entities/member-refresh/repo/createMemberRefresh';
// import Member from '@entities/member/Member';
import { JWT } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
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
const refreshToken = async ({
  email,
  googleId,
  memberId,
  res,
  rToken,
  userId
}: RefreshTokenArgs): Promise<string> => {
  if (!email && !googleId && !memberId && !rToken && !userId) return null;

  let queryArgs: FilterQuery<User>;

  if (googleId) queryArgs = { googleId };
  else if (userId) queryArgs = { id: userId };
  else if (email) queryArgs = { email };
  else if (rToken) queryArgs = { refreshToken: rToken };
  else if (memberId) queryArgs = { members: { id: memberId } };

  const user: User = await new BloomManager().findOne(User, queryArgs);

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) {
    if (res) res.clearCookie('accessToken', 'refreshToken');
    return null;
  }

  const payload = {
    userId: user.id,
    ...(email ? { event: VerifyEvent.LOG_IN } : {})
  };

  const accessToken: string = signToken({ payload });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) {
    const options = {
      httpOnly: true,
      secure: process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'prod'
    };

    res.cookie('accessToken', accessToken, {
      ...options,
      maxAge: JWT.EXPIRES_IN * 1000 // x1000 b/c represented as milliseconds.
    });

    res.cookie('refreshToken', user.refreshToken, options);
  }

  // await createMemberRefresh({ memberId: member.id });

  return accessToken;
};

export default refreshToken;
