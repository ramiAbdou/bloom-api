import express from 'express';
import { oauth2_v2 as oauth2V2 } from 'googleapis';

import { findAndUpdate, findOneAndUpdate } from '@core/db/db.util';
import Member from '@entities/member/Member';
import getLoginError from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import User from '@entities/user/User';
import { APP } from '@util/constants';
import { ErrorContext, ErrorType } from '@util/constants.errors';
import getGoogleProfileFromToken from './getGoogleProfileFromToken';

interface ParsedGoogleAuthQueryState {
  communityId?: string;
  pathname?: string;
}

/**
 * Redirects back to the React app after updating the User's tokens and
 * potentially updating their Google-related information.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleGoogleAuth = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { code, state } = req.query;

  // If state is undefined, JSON.parse will throw an error, so we provide '{}'
  // as an alternative JSON string which will return {}.
  const safeState: string = (state as string) ?? '{}';

  // Query state will store the communityId and pathname in the case that
  // we want to check if the user is a part of a certain community, and we
  // need to redirect to someone pathname.
  const { communityId, pathname }: ParsedGoogleAuthQueryState = JSON.parse(
    safeState
  );

  const {
    email,
    id: googleId,
    picture: pictureUrl
  }: oauth2V2.Schema$Userinfoplus = await getGoogleProfileFromToken(
    code as string
  );

  // Try to update the User's googleId and the Member(s)' profile pictures
  // if they are non-existent.
  await Promise.all([
    findOneAndUpdate(User, { email }, { googleId }),
    findAndUpdate(Member, { email }, { pictureUrl })
  ]);

  const loginError: ErrorType = await getLoginError({ communityId, email });

  // We have to set the error in the cookie and not throw an error because
  // we have to redirect back to the React application.
  if (loginError) res.cookie(ErrorContext.LOGIN_ERROR, loginError);
  else await refreshToken({ googleId }, { res });

  return res.redirect(APP.CLIENT_URL + (pathname ?? ''));
};

export default handleGoogleAuth;
