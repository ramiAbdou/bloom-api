import { Request, Response, Router } from 'express';

import { APP } from '@util/constants';
import getLoginError, { LoginError } from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import getGoogleToken from './repo/getGoogleToken';

const router = Router();

/**
 * GET: Google Login Authentication
 *
 * Controls the login flow when a user signs in with Google.
 */
router.get('/auth', async ({ query }: Request, res: Response) => {
  // Query state will store the communityId and pathname in the case that
  // we want to check if the user is a part of a certain community, and we
  // need to redirect to someone pathname.
  const { communityId, pathname } =
    JSON.parse((query?.state ?? null) as string) ?? {};

  const { email } = await getGoogleToken(query.code as string);
  const loginError: LoginError = await getLoginError({ communityId, email });

  if (loginError) res.cookie('LOGIN_ERROR', loginError);
  else await refreshToken({ email, res });

  res.redirect(APP.CLIENT_URL + (pathname ?? ''));
});

export default router;
