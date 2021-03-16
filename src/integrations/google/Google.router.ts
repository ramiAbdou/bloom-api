import { Request, Response, Router } from 'express';
import { oauth2_v2 } from 'googleapis';

import getLoginError from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import { APP } from '@util/constants';
import { ErrorContext, ErrorType } from '@util/constants.errors';
import updatePictureUrl from '../../entities/member/repo/updatePictureUrl';
import updateGoogleId from '../../entities/user/repo/updateGoogleId';
import getGoogleProfileFromToken from './repo/getGoogleProfileFromToken';

const router = Router();

/**
 * GET: Google Login Authentication
 *
 * Controls the login flow when a user signs in with Google.
 */
router.get('/auth', async (req: Request, res: Response) => {
  const { code, state } = req.query ?? {};

  // Query state will store the communityId and pathname in the case that
  // we want to check if the user is a part of a certain community, and we
  // need to redirect to someone pathname.
  const { communityId, pathname } = JSON.parse((state ?? null) as string) ?? {};

  const {
    email,
    id: googleId,
    picture: pictureUrl
  }: oauth2_v2.Schema$Userinfoplus = await getGoogleProfileFromToken(
    code as string
  );

  // Try to update the User's googleId and the Member(s)' profile pictures
  // if they are non-existent.
  await Promise.all([
    updateGoogleId({ email, googleId }),
    updatePictureUrl({ email, pictureUrl })
  ]);

  const loginError: ErrorType = await getLoginError({ communityId, email });

  if (loginError) {
    res.cookie(ErrorContext.LOGIN_ERROR, loginError);
  } else await refreshToken({ email, googleId, res });

  res.redirect(APP.CLIENT_URL + (pathname ?? ''));
});

export default router;
