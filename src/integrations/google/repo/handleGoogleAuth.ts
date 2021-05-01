import express from 'express';
import { oauth2_v2 as oauth2V2 } from 'googleapis';

import updatePictureUrl from '@entities/member/repo/updatePictureUrl';
import getLoginError from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import updateUser from '@entities/user/repo/updateUser';
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
  const parsedState: ParsedGoogleAuthQueryState = JSON.parse(safeState);
  const { communityId, pathname } = parsedState;

  const googleProfile: oauth2V2.Schema$Userinfoplus = await getGoogleProfileFromToken(
    code as string
  );

  const { email, id: googleId, picture: pictureUrl } = googleProfile;

  // Try to update the User's googleId and the Member(s)' profile pictures
  // if they are non-existent.
  await Promise.all([
    updateUser({ email }, { googleId }),
    updatePictureUrl({ email, pictureUrl })
  ]);

  const loginError: ErrorType = await getLoginError({ communityId, email });

  if (loginError) {
    res.cookie(ErrorContext.LOGIN_ERROR, loginError);
  } else await refreshToken({ email, googleId, res });

  return res.redirect(APP.CLIENT_URL + (pathname ?? ''));
};

export default handleGoogleAuth;
